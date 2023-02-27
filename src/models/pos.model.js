const { Op } = require('sequelize');
const { ticketsl_promo, ticketsl_loja } = require('../schemas');
const { SHA256, AES, MD5 } = require('crypto-js');

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
}

module.exports = POS;