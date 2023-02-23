const { Op } = require('sequelize');
const { Ingresso } = require('../models');

const { ticketsl_promo, ticketsl_loja } = require('../schemas');

const {
    tbl_ingressos,
    tbl_itens_classes_ingressos,
} = ticketsl_promo;

const {
    lltckt_product
} = ticketsl_loja;

/**
 * Controlador dos Ingressos
 */
class IngressoController {
    /**
     * Obs.:
     * - Por enquanto o banco não tem salvo o meio por PIX;
    */

    /**
     * Reserva um ou mais ingressos na sessão.
     * 
     * @param {Request} req { ingressos, sessao }
     * @param {Response} res 
     */
    static async reserve(req, res) {
        const { ingressos, sessao } = req.body;
        const model = new Ingresso();

        await model.reservaIngresso(ingressos, sessao)
        .then(status => {
            res.json({ status });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Reservar Ingressos',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cancela a reserva de um ou todos os ingressos na sessão.
     * 
     * @param {Request} req { ingressos, sessao }
     * @param {Response} res 
     */
    static async cancelReserve(req, res) {
        const { ingressos, sessao } = req.body;
        const model = new Ingresso();

        await model.cancelarReserva(ingressos, sessao)
        .then(status => res.json({ status }))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cancelar a Reserva',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Registra ingressos, mas ainda não confirmados pelo POS
     * 
     * @param {Request} req {
     *      ingressos,
     *      pag,
     *      pos
     * }
     * @param {Response} res 
     */
    static async register(req, res) {
        const { ingressos, pag, pos } = req.body;
        const model = new Ingresso();

        await model.createIngressos(ingressos, pag, pos)
        .then(data => res.json(data))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Registrar o Ingresso',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Valida a venda de um ou mais ingressos no POS, mas ainda pentende o recebimento
     * 
     * @param {Request} req { codes }
     * @param {Response} res 
     */
    static async validade(req, res) {
        // Organiza os ingressos em um array
        const codes = typeof req.body.codes === "object" ? [...req.body.codes] : [req.body.codes];
        const ingresso = new Ingresso();

        await ingresso.validarIngressos(codes)
        .then(result => res.json({ status: result }))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Validar o(s) Ingresso(s)',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Confirma o recebimento do(s) ingresso(s) e finaliza a compra
     * 
     * @param {Request} req { codes }
     * @param {Response} res 
     */
    static async received(req, res) {
        // Organiza os ingressos em um array
        const codes = typeof req.body.codes === "object" ? [...req.body.codes] : [req.body.codes];
        const ingresso = new Ingresso();
        
        // Atualiza o status dos ingressos para 'Ingresso Recebido'
        ingresso.ingressoRecebido(codes)
        .then(result => {
            res.json({ status: result });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Confirmar o Recebimento do(s) Ingresso(s)',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Obtêm os últimos ingresso registrados, mas não validados, nas últimas 5 horas.
     * 
     * @param {Request} req { pos }
     * @param {Response} res 
     */
    static async findLast(req, res) {
        const { pos } = req.body;

        // Margem de tempo: 5 horas
        const time = new Date();
        time.setHours(time.getHours() - 5);

        // Obtêm os ingresso não validados na margem de tempo
        await tbl_ingressos.findAll({
            where: {
                ing_pos: pos,
                ing_status: 0, // não validado
                ing_data_compra: { [Op.gte]: time }
            }
        })
        .then(data => res.json(data))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter os Ingressos',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cancela um ou mais ingressos
     * 
     * @param {Request} req { codes }
     * @param {Response} res 
     */
    static async cancel(req, res) {
        // Organiza os ingressos em um array
        const codes = typeof req.body.codes === "object" ? [...req.body.codes] : [req.body.codes];
        const ingresso = new Ingresso();

        await ingresso.cancelarIngressos(codes)
        .then(status => {
            res.json({result: status})
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cancelar o(s) Ingresso(s)',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cancela a última venda do POS
     * 
     * Obs.: talvez atualizar para cancelar os 'n' últimos vendidos,
     * sendo 'n' informado no request
     * 
     * @param {Request} req { pos }
     * @param {Response} res 
     */
    static async cancelLast(req, res) {
        const { pos } = req.body;
        const ingresso = new Ingresso();

        ingresso.cancelarUltimo(pos)
        .then(status => res.json({ status }))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cancelar o Último Ingresso Vendido',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = IngressoController;