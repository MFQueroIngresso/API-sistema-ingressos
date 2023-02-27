const { Op } = require('sequelize');
const { POS } = require('../models');

const { ticketsl_promo, ticketsl_loja } = require('../schemas');
const { SHA256, AES, enc } = require('crypto-js');
const { lltckt_product } = require('../schemas/ticketsl_loja');

const {
    tbl_pos,
    tbl_pdvs,
    tbl_modelo_pos,
    tbl_eventos_pdvs,
    tbl_eventos,
    tbl_classes_ingressos,
    tbl_itens_classes_ingressos,
    tbl_classes_ingressos_pdvs
} = ticketsl_promo;

const {
    lltckt_category,
    lltckt_eve_categorias
} = ticketsl_loja;


/**
 * Controlador das maquininhas (POS)
 */
class POSController {
    /**
     * Obtêm os dados de um POS
     * 
     * @param {Request} req { pos_serie }
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
     * Login do PDV, através do POS
     * 
     * @param {Request} req { login, senha }
     * @param {Response} res 
     */
    static async login(req, res) {
        const { login, senha } = req.body;

        // Descriptografa a senha
        // obs: ainda preciso decidir como será
        let pass = senha;

        const model = new POS();
        await model.login(login, pass)
        .then(result => {
            // Hash para a obtenção dos dados
            const hash = AES.encrypt(result.pdv, result.sessao).toString();

            res.json({
                hash, sessao: result.sessao
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Logar no POS',
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
    static async list(_, res) {
        await tbl_pos.findAll({
            include: {
                model: tbl_modelo_pos,
                as: 'modelo'
            }
        })
        .then(data => {
            res.json(data);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Obter os POS',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Cadastra um novo POS
     * 
     * @param {Request} req {
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
     * @param {Request} req {
     *      mod_browser,
     *      mod_modelo,
     *      mod_data_inclusao
     * }
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

    /**
     * Obtêm os dados do PDV/POS.
     * 
     * @param {Request} req { hash, sessao }
     * @param {Response} res 
     */
    static async getData(req, res) {
        const { hash, sessao } = req.body;

        try {
            const model = new POS();
            const pdv = parseInt(AES.decrypt(hash, sessao).toString(enc.Utf8));
            
            await model.getEventosAutorizados(pdv)
            .then(a => res.json(a))
        }
        catch(e) {
            console.error(e);
            res.status(400).json({
                erro: 'Erro ao Obtêr os Dados do PDV',
                message: JSON.stringify(e)
            });
        }
    }

    /**
     * Obtêm os dados recentes do estoque de um evento.
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    static async getClass(req, res) {
        const { hash, sessao, evento } = req.body;

        const pdv = parseInt(AES.decrypt(hash, sessao).toString(enc.Utf8));

        const model = new POS();
        await model.getEventoClasses(pdv, evento)
        .then(a => res.json(a))
        .catch(e => {
            console.log(e);
            res.status(400).json({
                erro: 'Erro ao Obter o Estoque',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = POSController;