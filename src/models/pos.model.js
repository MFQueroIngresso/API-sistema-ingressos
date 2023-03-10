const { Op } = require('sequelize');
const { ticketsl_promo, ticketsl_loja } = require('../schemas');
const { SHA256, MD5 } = require('crypto-js');

const {
    usuario,
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
    lltckt_category_description,
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
     * Realiza o acesso do administrador no POS.
     * 
     * @param {string} login 
     * @param {string} senha 
     * @returns 
     */
    async loginAdm(login, senha) {
        return usuario.findOne({
            where: {
                LOGIN: login,
                SENHA: senha
            },
            attributes: [ 'CODIGO' ]
        })
        .then(a => {
            // Usuário não encontrado?
            if(!a?.CODIGO) throw 'Login ou Senha inválidos';

            // Verifica se o usuário é um administrador dos POS
            const is_adm = a.CODIGO === parseInt(process.env.ADM_POS);

            return is_adm;
        })
    }

    /**
     * Obtêm os Eventos autorizados ao PDV/POS.
     * 
     * @param {number} pdv Id do PDV.
     */
    async getEventosAutorizados(pdv) {

        // Eventos permitidos
        const allowed_eventos = []

        // Obtêm os dados do PDV
        const pdv_data = await tbl_pdvs.findByPk(pdv, {
            include: {
                model: tbl_eventos_pdvs,
                attributes: [ 'evp_pdv', 'evp_evento' ],
                separate: true,
                include: {
                    model: tbl_eventos,
                    where: {
                        eve_ativo: 1,
                        eve_fim: { [Op.gte]: Date.now() }
                    },
                    attributes: [ 'eve_cod', 'eve_ativo', 'eve_fim' ]
                }
            }
        })
        .then(data => {
            const pdv = JSON.parse(JSON.stringify(data));

            // Agrupa os eventos permitidos
            pdv.tbl_eventos_pdvs.map(e => allowed_eventos.push(e.evp_evento))
            delete pdv.tbl_eventos_pdvs;

            // Retorna os dados do PDV
            return pdv;
        });

        // Obtêm todos os eventos e ingressos permitidos ao POS
        return await tbl_eventos.findAll({
            where: {
                eve_cod: { [Op.in]: allowed_eventos }
            },
            separate: true,
            include: [
                {
                    model: lltckt_eve_categorias,
                    required: false,
                    include: {
                        model: lltckt_category,
                        attributes: [ 'category_id', 'mapa', 'image' ],
                        required: false,
                    },
                    limit: 1//
                }
            ]
        })
        .then(async data => {
            const eventos = JSON.parse(JSON.stringify(data));

            // Obtem a Logo do evento
            const get_logo = async eve_cod => {
                // URL base das logos de impressão
                const url_base = 'http://gestao.qingressos.com/images/evento';

                // Endereço da logo
                const logo = `${url_base}/${eve_cod}.bmp`;

                // Valida a URL da logo
                return await this.validateUrl(logo);
            }

            // Obtem a Imagem da Vitrine
            const get_vitrine = async image_name => {
                // URL base das imagens dos eventos
                const url_base = 'https://qingressos.com/image/cache';

                // Link da imagem do evento
                const link_image = `${url_base}/${image_name}`;

                // Obtêm a extensão da imagem
                const type = [
                    link_image.indexOf('.png'),
                    link_image.indexOf('.jpg'),
                ]

                // Adiciona as dimensões da imagem
                const position = type.find(a => a >= 0);
                const image = link_image.substring(0, position) + '-638x359' + link_image.substring(position);

                // Valida a URL da imagem
                return await this.validateUrl(image);
            }

            // Obtem o Mapa dos Ingressos
            const get_mapa_ing = async eve_mapa => {
                if(!!eve_mapa) {
                    // URL base do mapa
                    const url_base = 'http://gestao.qingressos.com/images/mapa';
                    const mapa = `${url_base}/${eve_mapa}`;

                    // Valida a URL do mapa
                    return await this.validateUrl(mapa);
                }
                return null;
            }

            // Obtem o Mapa Estático do Evento
            const get_mapa_estatico = async mapa => {
                if(!!mapa) {
                    // URL base do mapa estático
                    const url_base = `http://gestao.qingressos.com/images/evento`;

                    // Nome da imagem
                    const split_aux = mapa.split('/');
                    const mEstatico = split_aux[split_aux.length -1]
                    const mapa_estatico = `${url_base}/${mEstatico}`;

                    // Valida a URL do mapa estático
                    return await this.validateUrl(mapa_estatico);
                }
                return null;
            }

            const aux = eventos.map(async evento => (
                new Promise(async resolve => {

                    // Obtem os links de imagens/mapas do Evento
                    const gets = [
                        // Logo do Evento
                        get_logo(evento.eve_cod),

                        // Imagem da Vitrine
                        get_vitrine(evento.lltckt_eve_categorias[0].lltckt_category.image),

                        // Mapa dos Ingressos
                        get_mapa_ing(evento.eve_mapa),

                        // Mapa Estático
                        get_mapa_estatico(evento.lltckt_eve_categorias[0].lltckt_category.mapa)
                    ]

                    await Promise.all(gets).then(data => {
                        evento.eve_logo = data[0];      // Logo do Evento
                        evento.image = data[1];         // Imagem da Vitrine
                        evento.eve_mapa = data[2];      // Mapa dos Ingressos
                        evento.mapa_estatico = data[3]; // Mapa Estático

                        delete evento.lltckt_eve_categorias;

                        resolve(evento);
                    });
                })
            ));

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

    /**
     * Obtêm as informações do Evento para o POS.
     * 
     * @param {number} evento Id do Evento.
     */
    async getEventoInfo(evento) {
        return await lltckt_eve_categorias.findOne({
            where: { codEvePdv: evento },
            attributes: [ 'codEvePdv' ],
            include: {
                model: lltckt_category,
                attributes: [ 'category_id' ],
                include: {
                    model: lltckt_category_description,
                    attributes: [ 'release' ]
                }
            }
        })
        .then(result => {
            if(!!result) {
                // Descrição do Evento
                const raw_text = result?.lltckt_category?.lltckt_category_description?.release;

                // Evento sem descrição?
                if(!raw_text) throw 'Evento sem descrição';

                // Decodificador de texto HTML
                const { decode } = require('html-entities');

                // Codifica as entidades HTML em texto
                const description = decode(raw_text);

                // Retorna a descrição do Evento
                return { description }
            }
            else throw 'Evento não encontrado';
        });
    }
}

module.exports = POS;