const { ticketsl_promo } = require('../schemas');
const {
    tbl_status
} = ticketsl_promo;

/**
 * Controlador dos status gerais
 * 
 * ex.: ingressos, empresas, lotes, turnos e sessões
 */
class StatusController {
    /**
     * Cadastra um novo status
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add(req, res) {
        await tbl_status.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'Status Cadastrado',
                id: data?.sta_id
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cadastrar o Status',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = StatusController;