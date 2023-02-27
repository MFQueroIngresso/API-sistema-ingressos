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
            include: {
                model: tbl_eventos,
                where: { eve_ativo: 1 } // somente eventos ativos
            }
        })
        .then(eventos => eventos?.map(e => e?.evp_evento));

        // Agrupa os ingressos permitidos
        const allowed_tickets = await tbl_classes_ingressos_pdvs.findAll({ where: { cip_pdv: pdv }})
        .then(tickets => tickets?.map(e => e?.cip_classe_ingresso));


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
                        /* { model: lltckt_product } */
                    ]
                }
            ]
        })
        .then(data => {
            const eventos = JSON.parse(JSON.stringify(data));

            //console.log(eventos[0].eve_nome)
            eventos.map(async evento => {
                // Logo do Evento


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
                evento.image = image; // depois usar uma validação de url


                // Mapa dos Ingressos
                const url_base_mapa = 'http://gestao.qingressos.com/images/mapa';
                const mapa = `${url_base_mapa}/${evento.eve_mapa}`;

                // Valida a URL do mapa
                evento.eve_mapa = mapa // depois usar uma validação de url


                // Alterações no json
                evento.tbl_classes_ingressos.map(a => {
                    // Altera "tbl_itens_classes_ingressos" de um array[1] para json
                    a.tbl_itens_classes_ingressos = a.tbl_itens_classes_ingressos[0];

                    // Altera "lltckt_product" de um array para json
                    //a.lltckt_products = a.lltckt_products[0];
                    return a;
                });

                // Altera "lltckt_eve_categorias" de um array para json
                // obs.: pegando o primeiro valor do array (mudar depois)
                evento.lltckt_category = evento.lltckt_eve_categorias[0].lltckt_category;
                delete evento.lltckt_eve_categorias;
            });

            return { pdv: pdv_data, data: eventos }
        });
    }
}

module.exports = POS;