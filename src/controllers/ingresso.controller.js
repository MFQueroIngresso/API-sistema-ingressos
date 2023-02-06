const { Op } = require('sequelize');
const { ticketsl_promo, ticketsl_loja } = require('../models');

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
     * Registra um ingresso, mas ainda não confirmado pelo POS
     * 
     * Obs.: depois tem de alterar para:
     * - Registrar mais de um tipo ingresso;
     * - Limitar o máximo de ingressos vendidos;
     * - Verificar se o evento foi cancelado/finalizado;
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
        const data = {
            ing_evento: evento,          // Evento
            ing_data_compra: new Date(), // Data da compra
            ing_pos: pos,                // POS
            ing_classe_ingresso: classe, // Classe do ingresso
            ing_status: 0,               // Status do ingresso: não confirmado
            ing_enviado: 0,              // Ingresso não enviado
            
            
            ing_mpgto: 1,                // mudar depois*

            ing_item_classe_ingresso: 0, //
        };

        /**
         * Gera os códigos de barras dos ingressos, em EAN13.
         * 
         * @returns {Promise<number[]>}
         */
        const barcodeGen = async () => {
            const codes = []
            const max = 100000000000;//
            const min = 999999999999;//

            // Auxiliar da quantidade de ingressos a serem gerados
            let count = quant;

            // Gera 'n' códigos, pela quandidade informada (count)
            while(count > 0) {
                // Gera um código aleatório
                const code = Math.floor(Math.random() * (max - min)  + min);

                // Verifica se o código já é utilizado
                await tbl_ingressos.findByPk(code)
                .then(result => {
                    // Não é utilizado?
                    if(!result) {
                        // Adiciona o código e reduz a contagem
                        codes.push(code);
                        count--;
                    }

                    // Se o código já for utilizado, repete o loop
                });
            }

            return codes;
        }

        try {
            // Classe do Ingresso
            await tbl_classes_ingressos.findOne({
                where: { cla_cod: classe },
                include: {
                    model: tbl_itens_classes_ingressos,
                    order: [
                        ['itc_prioridade', 'ASC'], // organizar por prioridade
                        ['itc_quantidade', 'ASC']  //  "    "   por quantidade
                    ],
                    limit: 1
                }
            })
            .then(({ dataValues: ing_class }) => {
                const aux = ing_class.tbl_itens_classes_ingressos[0];

                // Não há ingressos disponíveis?
                if(aux.itc_quantidade <= 0) throw 'Não há ingressos disponíveis';

                data.ing_item_classe_ingresso = aux.itc_cod; // Item da classe
                data.ing_valor = aux.itc_valor;              // Valor do ingresso
                data.ing_taxa = ing_class.cla_valor_taxa;    // Taxa
                data.ing_meia = ing_class.cla_meia_inteira;  // Meia/Inteira
            });

            // Dados do POS
            await tbl_pos.findOne({
                where: { pos_serie: pos }
            })
            .then(({ dataValues: pos_data }) => {
                data.ing_pdv = pos_data.pos_pdv;             // PDV
                data.ing_empresa = pos_data.pos_empresa;     // Empresa
            });


            const ings = await barcodeGen().then(codes => (
                codes.map(a => ({ ing_cod_barras: a, ...data }))
            ));

            // Registra a venda
            await tbl_ingressos.bulkCreate(ings)
            .then(async ingressos => {
                // Algum ingresso não foi registrado?
                if(ingressos.length < quant) throw '';// falta uma mensagem de erro

                // Reduz o estoque do promo
                await tbl_itens_classes_ingressos.decrement(
                    { itc_quantidade: quant },
                    { where: {
                        itc_cod: data.ing_classe_ingresso
                    }}
                )
                .then(result => {
                    // Falha ao reduzir a quantidade de ingressos?
                    if(result[1] < 0) throw 'Falha ao reduzir a quantidade de ingressos';
                });

                // Retorna os ingressos registrados
                const codes = ingressos.map(a => a.ing_cod_barras);
                await tbl_ingressos.findAll({
                    where: {
                        ing_cod_barras: { [Op.in]: codes }
                    }
                })
                .then(data => res.json(data));
            });
        }
        catch(e) {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Registrar o Ingresso',
                message: JSON.stringify(e)
            });
        }
    }

    /**
     * Confirma a venda do(s) ingresso(s) no POS, mas ainda pentende o recebimento
     * 
     * @param {Request} req { cod }
     * @param {Response} res 
     */
    static async confirmIngresso(req, res) {
        // Organiza o(s) ingresso(s) em um array
        const ingressos = typeof req.body.cod === "string" ? [req.body.cod] : [...req.body.cod];
        
        await tbl_ingressos.update(
            { ing_status: 1 },
            { where: {
                ing_cod_barras: { [Op.in]: ingressos }
            }}
        )
        .then(async result => {
            // Os ingressos foram confirmados?
            if(result[0] === ingressos.length) {
                await tbl_ingressos.findAll({
                    where: {
                        ing_cod_barras: { [Op.in]: ingressos }
                    }
                })
                .then(data => {
                    res.json(data);
                });
            }
            else throw '';// falta uma mensagem de erro
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Confirmar o(s) Ingresso(s)',
                message: JSON.stringify(e)
            });
        });
    }

    /**
     * Confirma o recebimento do(s) ingresso(s) e finaliza a compra
     * 
     * @param {Request} req { cod }
     * @param {Response} res 
     */
    static async finishIngresso(req, res) {
        // Organiza o(s) ingresso(s) em um array
        const ingressos = typeof req.body.cod === "string" ? [req.body.cod] : [...req.body.cod];
        
        await tbl_ingressos.update(
            { ing_status: 2 },
            { where: {
                ing_cod_barras: { [Op.in]: ingressos }
            }}
        )
        .then(result => {
            res.json({ status: result[0] === ingressos.length });
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
     * Cancela uma venda de ingresso
     * 
     * @param {Request} req { cod }
     * @param {Response} res 
     */
    static async cancelIngresso(req, res) {
        const { ing_cod_barras, itc_cod } = req.body;

        await tbl_ingressos.findByPk(ing_cod_barras)
        .then(async ({ dataValues: ingresso }) => {
            await tbl_ingressos.destroy({
                where: { ing_cod_barras }
            })
            .then(async result => {
                // Ingresso não deletado
                if(!result) throw 'Falha ao remover o Ingresso';
    
                // Aumenta a quantidade de ingressos disponíveis em 1
                await tbl_itens_classes_ingressos.increment(
                    { itc_quantidade: 1 },
                    { where: {
                        itc_cod: ingresso.ing_item_classe_ingresso
                    }}
                )
                .then(result => {
                    res.json({ status: result[1] < 0 });
                });
            });
        })
        .catch(e => {
            console.error(e);
            res.status(400).json({
                error: 'Erro ao Cancelar o Ingresso',
                message: JSON.stringify(e)
            });
        });
    }
}

module.exports = IngressoController;