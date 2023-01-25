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
     * ex.: { pos_serie }
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
     * @param {*} _ 
     * @param {Response} res 
     */
    static async list(_, res) {}

    /**
     * Cadastra um novo POS
     * 
     * ex.: {
     *      pos_serie,
     *      pos_modelo,
     *      pos_pdv,
     *      pos_operadora,
     *      pos_finalidade,
     *      pos_data_inclusao,
     *      pos_numero_chip,
     *      pos_empresa,
     *      pos_posweb_key,
     *      pos_versao_navs,
     *      pos_versao_qi,
     *      pos_numero_celular,
     *      pos_tipo_conexao,
     *      pos_data_credito,
     *      pos_ativacao_smart_card,
     *      pos_password,
     *      pos_quantidade_parcela,
     *      pos_percentual_taxa
     * }
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
                error: 'Erro ao Cadastrar o POS',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra um novo modelo de POS
     * 
     * ex.: {
     *      mod_browser
     *      mod_modelo
     *      mod_data_inclusao
     * }
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
                error: 'Erro ao Cadastrar o Modelo de POS',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = POSController;