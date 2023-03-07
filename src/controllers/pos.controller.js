const { POS } = require('../models');
const { AES, enc } = require('crypto-js');

/**
 * Controlador das maquininhas (POS)
 */
class POSController {
    
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

    /**
     * Obtêm as informações do Evento para o POS.
     * 
     * @param {Request} req { evento }
     * @param {Response} res 
     */
    static async getInfo(req, res) {
        const { evento } = req.body;
        const model = new POS();

        await model.getEventoInfo(evento)
        .then(a => res.json(a))
        .catch(e => {
            console.error(e);
            res.status(400).json({
                erro: 'Erro ao Obter as Informações do Evento',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = POSController;