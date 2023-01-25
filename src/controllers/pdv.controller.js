const { ticketsl_promo } = require('../models');
const {
    tbl_pdvs
} = ticketsl_promo;

/**
 * Controlador dos PDVs (Pontos de Venda)
 */
class PDVController {
    /**
     * Obtêm os dados de um PDV
     * 
     * ex.: { pdv_id }
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async find(req, res) {
        const { pdv_id } = req.body;

        await tbl_pdvs.findOne({
            where: { pdv_id }
        })
        .then(data => {
            res.json(data);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter o PDV',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Lista os PDVs cadastrados
     * 
     * @param {*} _ 
     * @param {Response} res 
     */
    static async list(_, res) {
        await tbl_pdvs.findAll()
        .then(data => {
            res.json(data);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter os PDVs',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra um novo PDV
     * 
     * ex.: {
     *      pdv_nome,
     *      pdv_endereco,
     *      pdv_telefone,
     *      pdv_observacao,
     *      pdv_data_inclusao,
     *      pdv_cliente,
     *      pdv_empresa,
     *      pdv_cartao,
     *      pdv_login,
     *      pdv_senha,
     *      pdv_ativo,
     *      pdv_tipo,
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
        await tbl_pdvs.create(JSON.parse(JSON.stringify(req.body)))
        .then(data => {
            res.json({
                message: 'PDV Cadastrado',
                id: data?.pdv_id
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                erro: 'Erro ao Cadastrar o PDV',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Atualiza os dados de um PDV
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async up(req, res) {
        res.json({ message: 'Não implementado' });
    }

    /**
     * Deleta um PDV informado
     * 
     * ex.: { pdv_id }
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async del(req, res) {
        const { pdv_id } = req.body;

        await tbl_pdvs.destroy({
            where: { pdv_id }
        })
        .then(result => {
            if(!result) throw 'PDV não encontrado';

            res.json({ message: 'PDV Deletado' });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Deletar o PDV',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = PDVController;