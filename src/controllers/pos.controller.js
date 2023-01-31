const { Op } = require('sequelize');
const { ticketsl_promo } = require('../models');
const { SHA256, AES } = require('crypto-js');
const Stream = require('stream').Transform;
const https = require('https');
const fs = require('fs');
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
        await tbl_pos.findOne({
            where: { pos_serie },
            /* include: {
                model: tbl_pdvs,
                where: {
                    pdv_login,
                    pdv_senha: pass
                },
            } */
        })
        .then(data => {
            // O POS não foi encontrado?
            if(!data) throw "Login ou Senha inválidos";

            const hash = SHA256(JSON.stringify(data)).toString();
            res.json({ hash });
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
     * Procura por atualizações nos dados do POS,
     * comparando a chave hash informada.
     * 
     * @param {Request} req { pos_serie, hash }
     * @param {Response} res 
     */
    static async searchUpdate(req, res) {
        const { pos_serie, hash } = req.body;

        await tbl_pos.findOne({ where: { pos_serie }})
        .then(async result => {
            // O POS não foi encontrado?
            if(!result) throw 'POS desconhecido';
    
            // Obtêm o id do PDV
            const pdv = result?.dataValues?.pos_pdv;
    
            // Agrupa os eventos permitidos
            const allowed_eventos = await tbl_eventos_pdvs.findAll({
                where: { evp_pdv: pdv },
                include: {
                    model: tbl_eventos,
                    where: { eve_ativo: 1 } // somente eventos ativos
                }
            })
            .then(eventos => {
                return eventos?.map(e => e?.evp_evento)
            });
    
            // Agrupa os ingressos permitidos
            const allowed_tickets = await tbl_classes_ingressos_pdvs.findAll({ where: { cip_pdv: pdv }})
            .then(tickets => tickets?.map(e => e?.cip_classe_ingresso));
    
            // Obtêm todos os eventos e ingressos permitidos ao POS
            await tbl_eventos.findAll({
                where: {
                    eve_cod: { [Op.in]: allowed_eventos }
                },
                include: {
                    model: tbl_classes_ingressos,
                    where: {
                        cla_cod: { [Op.in]: allowed_tickets }
                    },
                    include: {
                        model: tbl_itens_classes_ingressos,
                        order: [
                            ['itc_prioridade', 'ASC'], // organizar por prioridade
                            ['itc_quantidade', 'ASC']  //  "    "   por quantidade
                        ],
                        limit: 1
                    }
                }
            })
            .then(result => {
                const data = JSON.parse(JSON.stringify(result));

                // Hash dos dados do POS
                const _this = SHA256(JSON.stringify(data)).toString();

                // Hash do POS
                const hash_pos = SHA256(JSON.stringify(result)).toString();

                // O hash do request está vazio/é inválido?
                if(!hash) throw 'Hash vazio ou inválido';
    
                // Os dados do banco diferem do hash no request?
                // Ou o hash do POS é igual ao hash no request?
                if(_this !== hash || hash_pos === hash) {
                    // URL base das imagens dos eventos
                    const url_base = 'https://qingressos.com/image/cache/data/';

                    // Armazena as mudanças feitas nos dados
                    const setChanges = [];

                    // Organiza os dados (eventos)
                    data.forEach(value => {
                        setChanges.push(new Promise(async (resolve, reject) => {
                            // Obtêm a logo do evento
                            const getImage = new Promise((imgResolve, imgReject) => {
                                https.request(`${url_base}/${value.eve_cod}/${value.eve_cod}_imageOutdor-457x400.png`, resp => {
                                    const data = new Stream();

                                    // Se a imagem não for encontrada, retorna null
                                    if(resp.statusCode === 404) imgResolve(null);
        
                                    resp.once('data', chunck => {
                                        data.push(chunck);
                                    });
        
                                    resp.once('end', () => {
                                        // Cria um arquivo temporário para a imagem
                                        const filepath = `${process.cwd()}/src/temp/image_${value.eve_cod}.jpg`;
                                        fs.writeFileSync(filepath, data.read());
                                        
                                        fs.createReadStream(filepath).once('data', img => {
                                            // Remove o arquivo temporário depois de usar a imagem
                                            fs.rmSync(filepath);
                                            imgResolve(img.toString('base64'));
                                        });
                                    });
    
                                    resp.on('error', error => {
                                        console.error(error)
                                        imgReject(error);
                                    });
                                })
                                .end();
                            });
                            
                            // Altera "tbl_itens_classes_ingressos" de um array[1] para json
                            value.tbl_classes_ingressos.map(a => {
                                a.tbl_itens_classes_ingressos = a.tbl_itens_classes_ingressos[0];
                                return a;
                            });
    
                            await getImage
                            .then(resp => {
                                // Defini a imagem do evento
                                value.image_logo = resp;
                                resolve(value);
                            })
                            .catch(e => {
                                console.error(e);
                                reject(e);
                            });
                        }));

                        return value;
                    });

                    // Aplica as mdanças feitas nos dados
                    Promise.all(setChanges).then(() => {
                        // Retorna o novo hash e os dados do POS
                        const data_code = data/* AES.encrypt(JSON.stringify(data), pos_serie).toString(); */
                        res.json({ hash: _this, data: data_code });
                    });
                }
                else
                    res.json({ message: 'Nenhuma Atualização Nova' });
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Procurar os Dados no POS',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = POSController;