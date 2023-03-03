const { Op } = require('sequelize');
const { ticketsl_promo, ticketsl_loja } = require('../schemas');
const { SHA256, MD5 } = require('crypto-js');

const {
    tbl_pos,
    tbl_pdvs,
    tbl_eventos_pdvs,
    tbl_eventos,
    tbl_classes_ingressos_pdvs,
    tbl_classes_ingressos,
    tbl_itens_classes_ingressos,
    tbl_classes_ingressos_pdvs_solidario,
    tbl_classe_ingressos_solidario,
    tbl_categorias_classes_ingressos
} = ticketsl_promo;

const {
    lltckt_eve_categorias,
    lltckt_category,
    lltckt_product,
} = ticketsl_loja;

/**
 * Regras de negócio dos POS
 */
class POS {

    /**
     * Verifica se a URL é válida.
     * 
     * @param {string} url 
     * @returns Retorna a `url` ou `null` (em caso de não ser válido).
     */
    async validateUrl(url) {
        const validate = new Promise(resolve => {
            try {
                new URL(url);

                const get = http => {
                    http.get(url, response => {
                        const error_codes = [403, 404];

                        if(error_codes.findIndex(a => a === response.statusCode) > 0)
                            resolve(null);
                        resolve(url)
                    });
                }

                const http = url.indexOf('https') >= 0
                    ? require('https') : require('http');
                get(http);
            }
            catch(e) {
                resolve(null);
            }
        });

        return await validate.then(a => a);
    }

    /**
     * Realiza o acesso do PDV/POS.
     * 
     * @param {string} login 
     * @param {string} senha 
     * @returns 
     */
    async login(login, senha) {
        return await tbl_pos.findOne({
            include: {
                model: tbl_pdvs,
                where: {
                    pdv_login: login,
                    pdv_senha: senha
                },
            }
        })
        .then(data => {
            // O POS não foi encontrado?
            if(!data) throw "Login ou Senha inválidos";

            // Sessão do POS
            const genSession = () => {
                const max = 1000;
                const min = 1;
                const code = Math.floor(Math.random() * (max - min)  + min);

                return MD5(`${code.toString()}/${SHA256(data.pos_pdv).toString()}`).toString();
            }
            
            return { pdv: `${data.pos_pdv}`, sessao: genSession() }
        });
    }

    /**
     * Obtêm os Eventos autorizados ao PDV/POS.
     * 
     * @param {number} pdv Id do PDV.
     */
    async getEventosAutorizados(pdv) {

        // Obtêm os dados do PDV
        const pdv_data = await tbl_pdvs.findByPk(pdv);

        // Agrupa os eventos permitidos
        const allowed_eventos = await tbl_eventos_pdvs.findAll({
            where: { evp_pdv: pdv },
            attributes: [ 'evp_pdv', 'evp_evento' ],
            include: {
                model: tbl_eventos,
                where: { eve_ativo: 1 }, // somente eventos ativos
                attributes: [ 'eve_cod', 'eve_ativo' ]
            }
        })
        .then(eventos => eventos?.map(e => e?.evp_evento));

        // Agrupa os ingressos permitidos
        const allowed_tickets = await tbl_classes_ingressos_pdvs.findAll({ where: { cip_pdv: pdv }})
        .then(tickets => tickets?.map(e => e?.cip_classe_ingresso));

        // Obtêm os ingressos solidários do PDV
        const allowed_solidario = await tbl_classes_ingressos_pdvs_solidario.findAll({
            where: {
                cipc_pdv: pdv,
                cipc_classe_ingresso: { [Op.in]: allowed_tickets }
            },
            include: {
                model: tbl_classe_ingressos_solidario,
                attributes: [ 'cis_cod', 'cis_cod_classe_ingresso' ]
            }
        })
        .then(solidarios => (
            solidarios?.map(a => a.tbl_classe_ingressos_solidario.cis_cod)
        ));

        // Obtêm as categorias das classes
        const categories = await tbl_categorias_classes_ingressos.findAll({
            where: {
                cat_evento: { [Op.in]: allowed_eventos }
            },
            attributes: [ 'cat_cod', 'cat_evento' ]
        })
        .then(categories => categories?.map(a => a.cat_cod));


        // Obtêm todos os eventos e ingressos permitidos ao POS
        return await tbl_eventos.findAll({
            where: {
                eve_cod: { [Op.in]: allowed_eventos }
            },
            include: [
                {
                    model: lltckt_eve_categorias,
                    include: {
                        model: lltckt_category
                    },
                    limit: 1//
                },
                {
                    model: tbl_classes_ingressos,
                    where: {
                        cla_cod: { [Op.in]: allowed_tickets },
                        cla_categoria_id: { [Op.notIn]: categories }
                    },
                    include: [
                        {
                            model: tbl_itens_classes_ingressos,
                            order: [
                                ['itc_prioridade', 'ASC'], // organizar por prioridade
                                ['itc_quantidade', 'ASC']  //  "    "   por quantidade
                            ],
                            limit: 1
                        },
                        /* { model: lltckt_product }, */
                        {
                            model: tbl_classe_ingressos_solidario,
                            as: 'solidarios',
                            where: { cis_cod: { [Op.in]: allowed_solidario } },
                            required: false
                        }
                    ]
                },
                {
                    model: tbl_categorias_classes_ingressos,
                    include: {
                        model: tbl_classes_ingressos,
                        where: {
                            cla_cod: { [Op.in]: allowed_tickets }
                        },
                        include: [
                            {
                                model: tbl_itens_classes_ingressos,
                                order: [
                                    ['itc_prioridade', 'ASC'], // organizar por prioridade
                                    ['itc_quantidade', 'ASC']  //  "    "   por quantidade
                                ],
                                limit: 1
                            },
                            /* { model: lltckt_product }, */
                            {
                                model: tbl_classe_ingressos_solidario,
                                as: 'solidarios',
                                where: { cis_cod: { [Op.in]: allowed_solidario } },
                                required: false
                            }
                        ]
                    }
                }
            ]
        })
        .then(async data => {
            const eventos = JSON.parse(JSON.stringify(data));

            const aux = eventos.map(async evento => (
                new Promise(async resolve => {

                    // Logo do Evento
                    // URL base das logos de impressão
                    const url_base_logo = 'http://gestao.qingressos.com/images/evento';

                    // Endereço da logo
                    const logo = `${url_base_logo}/${evento.eve_cod}.bmp`;

                    // Valida a URL da logo
                    evento.eve_logo = await this.validateUrl(logo);
    
    
                    // Imagem da Vitrine
                    // URL base das imagens dos eventos
                    const url_base_image = 'https://qingressos.com/image/cache';
    
                    // Endereço da imagem
                    const image_name = evento.lltckt_eve_categorias[0].lltckt_category.image;
    
                    // Link da imagem do evento
                    evento.image = `${url_base_image}/${image_name}`;
    
                    // Obtêm a extensão da imagem
                    const type = [
                        evento.image.indexOf('.png'),
                        evento.image.indexOf('.jpg'),
                    ]
    
                    // Adiciona as dimensões da imagem
                    const position = type.find(a => a >= 0);
                    const image = evento.image.substring(0, position) + '-638x359' + evento.image.substring(position);
    
                    // Valida a URL da imagem
                    evento.image = await this.validateUrl(image);
    
    
                    // Mapa dos Ingressos
                    if(evento.eve_mapa) {
                        const url_base_mapa = 'http://gestao.qingressos.com/images/mapa';
                        const mapa = `${url_base_mapa}/${evento.eve_mapa}`;
    
                        // Valida a URL do mapa
                        evento.eve_mapa = await this.validateUrl(mapa);
                    }
                    else evento.eve_mapa = null;
    
    
                    // Alterações no json
                    evento.tbl_classes_ingressos.map(a => {
                        // Altera "tbl_itens_classes_ingressos" de um array[1] para json
                        a.tbl_itens_classes_ingressos = a.tbl_itens_classes_ingressos[0];
    
                        // Altera "lltckt_product" de um array para json
                        //a.lltckt_products = a.lltckt_products[0];
                        return a;
                    });
    
                    delete evento.lltckt_eve_categorias;
    
                    resolve(evento);
                }))
            );

            return await Promise.all(aux).then(data => (
                { pdv: pdv_data, data }
            ));
        });
    }

    /**
     * Busca os dados mais recentes das classes do evento informado.
     * 
     * @param {number} pdv PDV onde o evento é vendido
     * @param {number} evento Id do evento
     */
    async getEventoClasses(pdv, evento) {

        // Agrupa os ingressos permitidos
        const allowed_tickets = await tbl_classes_ingressos_pdvs.findAll({
            where: { cip_pdv: pdv }
        })
        .then(tickets => tickets?.map(e => e?.cip_classe_ingresso));

        // Obtêm os ingressos solidários do PDV
        const allowed_solidario = await tbl_classes_ingressos_pdvs_solidario.findAll({
            where: {
                cipc_pdv: pdv,
                cipc_classe_ingresso: { [Op.in]: allowed_tickets }
            },
            include: {
                model: tbl_classe_ingressos_solidario,
                attributes: [ 'cis_cod', 'cis_cod_classe_ingresso' ]
            }
        })
        .then(solidarios => (
            solidarios?.map(a => a.tbl_classe_ingressos_solidario.cis_cod)
        ));

        const categories = await tbl_categorias_classes_ingressos.findAll({
            where: { cat_evento: evento },
            attributes: [ 'cat_cod', 'cat_evento' ]
        })
        .then(categories => categories?.map(a => a.cat_cod));

        // Obtêm os dados do evento
        return await tbl_eventos_pdvs.findOne({
            where: { evp_pdv: pdv },
            attributes: ['evp_pdv'],
            include: {
                model: tbl_eventos,
                attributes: ['eve_cod'],
                where: { eve_cod: evento },
                include: [
                    {
                        model: tbl_classes_ingressos,
                        where: {
                            cla_cod: { [Op.in]: allowed_tickets},
                            cla_categoria_id: { [Op.notIn]: categories }
                        },
                        include: [
                            {
                                model: tbl_itens_classes_ingressos,
                                order: [[ 'itc_prioridade', 'ASC' ]]
                            },
                            {
                                model: tbl_classe_ingressos_solidario,
                                as: 'solidarios',
                                where: { cis_cod: { [Op.in]: allowed_solidario } },
                                required: false
                            }
                        ]
                    },
                    {
                        model: tbl_categorias_classes_ingressos,
                        include: {
                            model: tbl_classes_ingressos,
                            where: {
                                cla_cod: { [Op.in]: allowed_tickets }
                            },
                            include: [
                                {
                                    model: tbl_itens_classes_ingressos,
                                    order: [[ 'itc_prioridade', 'ASC' ]]
                                },
                                {
                                    model: tbl_classe_ingressos_solidario,
                                    as: 'solidarios',
                                    where: { cis_cod: { [Op.in]: allowed_solidario } },
                                    required: false
                                }
                            ]
                        }
                    }
                ]
            }
        })
        .then(evento_pdv => {
            // Obtêm as classes do evento
            const classes = JSON.parse(JSON.stringify(
                evento_pdv.tbl_evento?.tbl_classes_ingressos
            ));

            // Obtêm as categorias do evento
            const categorias = JSON.parse(JSON.stringify(
                evento_pdv.tbl_evento?.tbl_categorias_classes_ingressos
            ));

            // Altera a lista de lotes para apenas um lote
            const set_lote = itens => {
                // Obtêm o index do primeiro lote não vazio
                const index = itens.findIndex(a => (
                    a.itc_quantidade > 0
                ));

                return itens[index >= 0 ? index : 0];
            }

            return {
                tbl_classes_ingressos: classes.map(classe => {
                    // Define o lote
                    classe.tbl_itens_classes_ingressos = set_lote(classe.tbl_itens_classes_ingressos);
                    return classe;
                }),
                tbl_categorias_classes_ingressos: categorias.map(categoria => {
                    categoria.tbl_classes_ingressos.map(classe => {
                        // Define o lote
                        classe.tbl_itens_classes_ingressos = set_lote(classe.tbl_itens_classes_ingressos);
                        return classe;
                    });

                    return categoria;
                })
            }
        });
    }
}

module.exports = POS;