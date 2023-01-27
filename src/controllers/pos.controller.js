const { Op } = require('sequelize');
const { ticketsl_promo } = require('../models');
const { SHA256 } = require('crypto-js')
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
     * @param {Request} req { pos_serie, pdv_login, pdv_senha }
     * @param {Response} res 
     */
    static async login(req, res) {
        const { pos_serie, pdv_login, pdv_senha } = req.body;

        // Descriptografa a senha
        let pass = pdv_senha;

        /* depois arrumar o include para realizar o login */
        await getPOSEvents(
            pos_serie,
            /* {
                model: tbl_pdvs,
                where: {
                    pdv_login,
                    pdv_senha: pass
                },
            } */null,
            'Login ou Senha inválidos'
        )
        .then(data => {
            const hash = SHA256(JSON.stringify(data)).toString();
            res.json({ hash, data });
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
     * Procura por atualizações nos dados do POS
     * 
     * @param {Request} req { pos_serie, hash }
     * @param {Response} res 
     */
    static async searchUpdate(req, res) {
        const { pos_serie, hash } = req.body;

        await getPOSEvents(pos_serie)
        .then(data => {
            const _this = SHA256(JSON.stringify(data)).toString();

            // Os dados do banco diferem do hash do POS?
            if(_this !== hash)
                res.json(data);
            res.json({ message: 'Nenhuma Atualização Nova' });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Procurar Atualizações no POS',
                message: JSON.stringify(e)
            });
        });
    }
}

/**
 * Obtêm os eventos e ingressos de um POS
 * 
 * @param {string} pos_serie 
 * @param {JSON|undefined} include Tabelas inclusas para direcionar a procura do POS
 * @param {string|undefined} error_msg Mensagem de erro no caso de não encontrar o POS
 * @returns {Promise<JSON>}
 */
const getPOSEvents = async (pos_serie, include, error_msg) => {
    return await tbl_pos.findOne({
        where: { pos_serie },
        include: include ?? null
    })
    .then(async result => {
        // O POS não foi encontrado?
        if(!result) throw error_msg ?? 'POS desconhecido';

        // Obtêm o id do PDV
        const pdv = result?.dataValues?.pos_pdv;

        // Agrupa os eventos permitidos
        const allowed_eventos = await tbl_eventos_pdvs.findAll({ where: { evp_pdv: pdv }})
        .then(eventos => eventos?.map(e => e?.evp_evento));

        // Agrupa os ingressos permitidos
        const allowed_tickets = await tbl_classes_ingressos_pdvs.findAll({ where: { cip_pdv: pdv }})
        .then(tickets => tickets?.map(e => e?.cip_classe_ingresso));

        // Retorna todos os eventos e ingressos permitidos ao POS
        return await tbl_eventos.findAll({
            where: {
                eve_cod: { [Op.in]: allowed_eventos }
            },
            include: {
                model: tbl_classes_ingressos,
                where: {
                    cla_cod: { [Op.in]: allowed_tickets }
                },
                include: {
                    model: tbl_itens_classes_ingressos
                }
            }
        });
    });
}

module.exports = POSController;