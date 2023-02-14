const { Op } = require('sequelize');
const { Ingresso } = require('../models');

const { ticketsl_promo, ticketsl_loja } = require('../schemas');

const {
    tbl_ingressos,
    tbl_itens_classes_ingressos,
    tbl_classes_ingressos,
    tbl_pos,
    tbl_eventos
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
     * - Depois tem de anotar o meio de pagamento, por enquanto o banco não tem salvo o meio por PIX;
    */

    /**
     * Registra ingressos, mas ainda não confirmados pelo POS
     * 
     * @param {Request} req {
     *      evento,
     *      classe,
     *      quant,
     *      pos
     * }
     * @param {Response} res 
     */
    static async register(req, res) {
        const { evento, classe, quant, pos } = req.body;
        const ingresso = new Ingresso();

        await ingresso.createIngressos(evento, classe, quant, pos)
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

        try {
            // Obtêm os ingressos a serem cancelados
            const ingressos = await tbl_ingressos.findAll({
                where: {
                    ing_cod_barras: { [Op.in]: codes },
                    ing_status: { [Op.notLike]: 3 }
                }
            });
            
            // Define o status dos ingressos como 'Cancelado(s)'
            await tbl_ingressos.update(
                { ing_status: 3 },
                { where: {
                    ing_cod_barras: { [Op.in]: codes }
                }}
            )
            .then(async result => {
                // Algum ingresso foi cancelado?
                if(!!result[0]) {
                    // Todos os ingressos foram cancelados?
                    if(result[0] === ingressos.length) {
                        // Incrementa os estoques para cada ingresso cancelado
                        const increment = [
                            // Estoques no 'ticketsl_promo'
                            new Promise(async (resolve, reject) => (
                                resolve(ingressos.map(async ingresso => (
                                    await tbl_itens_classes_ingressos.increment(
                                        { itc_quantidade: 1 },
                                        { where: {
                                            itc_cod: ingresso.ing_item_classe_ingresso
                                        }}
                                    )
                                    .then(a => a[1])
                                    .catch(e => reject(e))
                                )))
                            )),
                            // Estoques no 'ticketsl_loja'
                            new Promise(async (resolve, reject) => (
                                resolve(ingressos.map(async ingresso => (
                                    ingresso.ing_status >= 1 &&
                                    await lltckt_product.increment(
                                        { quantity: 1 },
                                        { where: {
                                            classId: ingresso.ing_classe_ingresso
                                        }}
                                    )
                                    .then(a => a[1])
                                    .catch(e => reject(e))
                                )))
                            ))
                        ]

                        await Promise.all(increment).then(result => {
                            res.json({ status: !!result.length });
                        });
                    }
                }
                else res.json({ status: result[0] === ingressos.length });
            });
        }
        catch(e) {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cancelar o(s) Ingresso(s)',
                message: JSON.stringify(e)
            });
        }
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

        // Encontra a última venda do POS
        await tbl_ingressos.findOne({
            where: {
                ing_pos: pos
            },
            order: [ ['ing_data_compra', 'DESC'] ]
        })
        .then(async ingresso => {
            if(ingresso.ing_status === 3) throw 'Ingresso já cancelado';
            
            await tbl_ingressos.update(
                { ing_status: 3 },
                { where: {
                    ing_cod_barras: ingresso.ing_cod_barras
                }}
            )
            .then(async result => {
                const status = !!result[0];

                // O ingresso foi cancelado?
                if(status) {
                    // Incrementa os estoques:

                    // Estoques no 'ticketsl_promo'
                    await tbl_itens_classes_ingressos.increment(
                        { itc_quantidade: 1 },
                        { where: {
                            itc_cod: ingresso.ing_item_classe_ingresso
                        }}
                    );

                    // Estoques no 'ticketsl_loja'
                    ingresso.ing_status >= 1 && await lltckt_product.increment(
                        { quantity: 1 },
                        { where: {
                            classId: ingresso.ing_classe_ingresso
                        }}
                    );
                }
                res.json({ status })
            });
        })
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