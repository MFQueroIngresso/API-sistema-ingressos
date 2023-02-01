const { ticketsl_promo } = require('../models');
const {
    tbl_ingressos,
} = ticketsl_promo;

/**
 * Controlador dos Ingressos
 */
class IngressoController {
    /**
     * Registra uma venda de ingresso, mas ainda não confirmada pelo POS
     * 
     * @param {Request} req {
     *      ing_cod_barras,
     *      ing_evento,
     *      ing_data_compra,
     *      ing_item_classe_ingresso,
     *      ing_valor,
     *      ing_classe_ingresso,
     *      ing_pos,
     *      ing_pdv,
     *      ing_rg,
     *      ing_data_val,
     *      ing_tipo,
     *      ing_qtd_uso,
     *      ing_max_uso,
     *      ing_data_ult_uso,
     *      ing_sexo,
     *      ing_meia,
     *      ing_empresa,
     *      ing_taxa,
     *      cln_cod,
     *      ing_numeracao,
     *      ing_mpgto,
     *      ing_cartao_auth,
     *      ing_nome,
     *      ing_cpf,
     *      ing_email,
     *      ing_fone,
     *      ing_data_nominacao
     * }
     * @param {Response} res 
     */
    static async setIngresso(req, res) {
        const data = req.body;

        // Defini o status do ingresso como não confirmado
        data.ing_status = 0;
        
        // Defini o ingresso como não enviado
        data.ing_enviado = 0;

        // Registra a venda
        await tbl_ingressos.create(req.body)
        .then(result => {
            res.json(!!result);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Registrar a Venda de Ingresso',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Confirma a venda do ingresso no POS, mas ainda pentende o recebimento
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async confirmIngresso(req, res) {
        res.status(501).json({
            message: 'Não implementado'
        });
    }

    /**
     * Confirma o recebimento do ingresso
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async finishIngresso(req, res) {
        res.status(501).json({
            message: 'Não implementado'
        });
    }

    /**
     * Cancela um ingresso
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async cancelIngresso(req, res) {
        res.status(501).json({
            message: 'Não implementado'
        });
    }
}

module.exports = IngressoController;