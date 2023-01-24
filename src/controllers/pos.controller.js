const { ticketsl_promo } = require('../models');
const {
    tbl_pos,
    tbl_modelo_pos
} = ticketsl_promo;

/**
 * Controlador das maquininhas (POS)
 */
class POSController {
    /**
     * Obtêm os dados de um POS
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async find(req, res) {
        const { pos_serie } = req.body;

        await tbl_pos.findOne({
            where: { pos_serie }
        })
        .then(data => {
            res.json(data);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter o POS',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Lista todos os POS cadastrados
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async list(req, res) {}

    /**
     * Cadastra um novo POS
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add(req, res) {
        await tbl_pos.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'POS Cadastrado',
                id: data?.pos_serie
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                erro: 'Erro ao Cadastrar o POS',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra um novo modelo de POS
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async add_modelo(req, res) {
        await tbl_modelo_pos.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'Modelo de POS Cadastrado',
                id: data?.mod_cod
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                erro: 'Erro ao Cadastrar o Modelo de POS',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = POSController;