const { Op } = require('sequelize');
const { ticketsl_promo, ticketsl_loja } = require('../schemas');
const schedule = require('node-schedule');

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
 * Regras de negócio dos Ingressos
 */
class IngressoModel {

    /**
     * Gera os códigos de barras dos ingressos, em EAN13.
     * 
     * @param {Number} quant
     * @returns {Promise<number[]>}
     */
    async barcodeGen(quant) {
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

    /**
     * Incrementa o estoque de ingressos em 'ticketsl_promo.tbl_itens_classes_ingressos'.
     * 
     * @param {number} quant Pode ser positivo (> 0) para aumentar o estoque, ou negativo (< 0) para reduzir.
     * @param {string} item_class ticketsl_promo.tbl_itens_classes_ingressos.ing_item_classe_ingresso
     * @returns {Promise<Number>}
     */
    async promoIncrement(quant, item_class) {
        if(quant < 0) {
            await tbl_itens_classes_ingressos.findOne({
                where: {
                    itc_cod: item_class,
                    itc_quantidade: 0
                },
                attributes: ['itc_cod']
            })
            .then(data => {
                if(!!data.itc_cod) throw 'Estoque vazio';
            });
        }

        return await tbl_itens_classes_ingressos.increment(
            { itc_quantidade: quant },
            { where: {
                itc_cod: item_class
            }}
        )
        .then(a => a[1]);
    }

    /**
     * Incrementa o estoque de ingressos em 'ticketsl_loja.lltckt_product'.
     * 
     * @param {number} quant Pode ser positivo (> 0) para aumentar o estoque, ou negativo (< 0) para reduzir.
     * @param {number} class_id ticketsl_loja.lltckt_product.class_id
     * @returns {Promise<number>} 
     */
    async lojaIncrement(quant, class_id) {
        if(quant < 0) {
            await lltckt_product.findOne({
                where: {
                    classId: class_id,
                    quantity: 0
                },
                attributes: ['product_id']
            })
            .then(data => {
                if(!!data.product_id) throw 'Estoque da loja vazio';
            });
        }

        return await lltckt_product.increment(
            { quantity: quant },
            { where: {
                classId: class_id
            }}
        )
        .then(a => a[1]);
    }

    /**
     * Verifica se o Evento informado já foi finalizado.
     * 
     * Obs.: talvez mover este método para outro model depois
     * 
     * @param {number} evento 
     */
    async verificarEventoFinalizado(evento) {
        await tbl_eventos.findOne({
            where: {
                eve_cod: evento
            },
            attributes: ['eve_ativo']
        })
        .then(evento => {
            if(!evento.eve_ativo) throw 'Evento finalizado';
        });
    }

    /**
     * Verifica se os ingressos estão cancelados.
     * 
     * @param {string[]} ingressos 
     */
    async verificarIngressoCancelado(ingressos) {
        await tbl_ingressos.findAll({
            where: {
                ing_cod_barras: { [Op.in]: ingressos },
                ing_status: 3
            }
        })
        .then(data => {
            // Há ingressos cancelados?
            if(data.length) {
                throw `Ingressos cancelados (${data.length}): ${data.map(a => a.ing_cod_barras).toString()}`
            }
        });
    }

    /**
     * Altera o status (ing_status) dos ingressos informados.
     * 
     * @param {string[]} ingressos Códigos de barras dos ingressos
     * @param {number} status 
     * 0 - Ingresso não confirmado pelo POS;
     * 
     * 1 - Ingresso vendido, mas pendente recebimento no evento;
     * 
     * 2 - Ingresso recebido no evento;
     * 
     * 3 - Ingresso cancelado.
     * 
     * @param {undefined|string} erro_msg Mensagem de erro específica
     * @returns {Promise<number>} Total de rows alteradas
     */
    async updateStatus(ingressos, status, erro_msg) {
        return await tbl_ingressos.update(
            { ing_status: status },
            { where: {
                ing_cod_barras: { [Op.in]: ingressos }
            }}
        )
        .then(async result => {
            // Algum ingresso não foi validado?
            if(result[0] !== ingressos.length) {
                throw erro_msg ?? `${ingressos.length - result[0]} Ingresso(s) não validado(s)`;
            }

            return result[0];
        });
    }

    /**
     * Registra determinada quantidade de ingressos, 
     * mas ainda não confirmados pelo POS.
     * 
     * Obs.: depois tem de alterar para:
     * - Registrar mais de um tipo ingresso;
     * - Limitar o máximo de ingressos vendidos;
     * - Verificar se o evento foi cancelado/finalizado;
     * 
     * @param {number} evento Id do Evento
     * @param {number} classe Classe do Ingresso
     * @param {number} quant quant > 0
     * @param {number} pag Meio de pagamento:
     * 
     * null - Pix; (temporário)
     * 
     * 1 - Dinheiro;
     * 
     * 2 - Crédito;
     * 
     * 3 - Débito.
     * 
     * @param {string} pos pos_serie do POS
     */
    async createIngressos(evento, classe, quant, pag, pos) {

        // Quantidade de ingressos <= 0?
        if(quant <= 0) throw 'Nenhum ingresso registrado';

        // Dados dos ingressos
        const data = {
            ing_evento: evento,          // Evento
            ing_data_compra: new Date(), // Data da compra
            ing_pos: pos,                // POS
            ing_classe_ingresso: classe, // Classe do ingresso
            ing_status: 0,               // Status do ingresso: não confirmado
            ing_enviado: 0,              // Ingresso não enviado
            ing_mpgto: pag,              // Meio de pagamento

            ing_item_classe_ingresso: 0, //
        };

        // Verifica se o Evento já foi finalizado
        this.verificarEventoFinalizado(evento);

        // Obtêm a classe do Ingresso
        await tbl_classes_ingressos.findOne({
            where: { cla_cod: classe },
            attributes: [
                'cla_cod',
                'cla_valor_taxa',
                'cla_meia_inteira'
            ],
            include: {
                model: tbl_itens_classes_ingressos,
                order: [
                    ['itc_prioridade', 'ASC'], // organizar por prioridade
                    ['itc_quantidade', 'ASC']  //  "    "   por quantidade
                ],
                attributes: [
                    'itc_classe',
                    'itc_quantidade',
                    'itc_cod',
                    'itc_valor'
                ],
                limit: 1
            }
        })
        .then(({ dataValues: ing_class }) => {
            const aux = ing_class.tbl_itens_classes_ingressos[0];

            // Não há ingressos disponíveis?
            if(aux.itc_quantidade <= 0) throw 'Não há ingressos disponíveis';

            // Há menos ingressos em estoque do que é requerido?
            if(aux.itc_quantidade < quant) throw 'Ingressos insuficientes em estoque';

            data.ing_item_classe_ingresso = aux.itc_cod; // Item da classe
            data.ing_valor = aux.itc_valor;              // Valor do ingresso
            data.ing_taxa = ing_class.cla_valor_taxa;    // Taxa
            data.ing_meia = ing_class.cla_meia_inteira;  // Meia/Inteira
        });

        // Obtêm os dados do POS
        await tbl_pos.findOne({
            where: { pos_serie: pos },
            attributes: [
                'pos_pdv',
                'pos_empresa'
            ]
        })
        .then(({ dataValues: pos_data }) => {
            data.ing_pdv = pos_data.pos_pdv;             // PDV
            data.ing_empresa = pos_data.pos_empresa;     // Empresa
        });

        // Gera os códigos de barras para cada ingresso
        const ings = await this.barcodeGen(quant).then(codes => (
            codes.map(a => ({ ing_cod_barras: a, ...data }))
        ));

        // Registra a venda
        return await tbl_ingressos.bulkCreate(ings)
        .then(async data => {
            // Algum ingresso não foi registrado?
            if(data.length < quant) throw 'Não foi possivel registrar todos os Ingressos';

            // Reduz o estoque 
            data.map(async ({ ing_item_classe_ingresso: item, ing_cod_barras: cod }) => {
                // Reduz o estoque do promo
                await this.promoIncrement(-1, item)
                .then(result => {
                    // O estoque não foi reduzido?
                    if(result <= 0) {
                        throw `Falha ao reservar o Ingresso: ${cod}`;
                    };
                });
            });

            // Retorna os ingressos registrados
            const codes = data.map(a => a.ing_cod_barras);
            const ingressos = await tbl_ingressos.findAll({
                where: {
                    ing_cod_barras: { [Op.in]: codes }
                }
            });

            // Inicia as schedule de cancelamento
            ingressos.map(ing => {
                // Quando o ingresso será cancelado
                const date = new Date();

                const start = () => {
                    schedule.scheduleJob(date, async () => {
                        await tbl_ingressos.update(
                            { ing_status: 3 },
                            { where: {
                                ing_cod_barras: ing.ing_cod_barras,
                                ing_status: 0
                            }}
                        );
                    });
                }

                // Define o tempo de espera máximo pela confirmação do pagamento
                switch (ing.ing_mpgto) {
                    // Pix
                    case null:
                        /* date.setMinutes(date.getMinutes() + 30);
                        start();
                        break; */
                    
                    // Dinheiro
                    case 1:
                        date.setMinutes(date.getMinutes() + 30);
                        start();
                        break;

                    // Crédito
                    case 2:
                        break;

                    // Débito
                    case 3:
                        break;
                
                    default: break;
                }
            });

            return ingressos;
        });
    }

    /**
     * Valida a venda dos ingressos informados,
     * mas ainda pendente o recebimento/impressão.
     * 
     * @param {string[]} ingressos Códigos de barras dos ingressos
     */
    async validarIngressos(ingressos) {
    
        // Verifica se há ingressos cancelados
        this.verificarIngressoCancelado(ingressos);

        return await this.updateStatus(ingressos, 1)
        .then(async result => {

            // Obtêm as classes dos ingressos
            return await tbl_ingressos.findAll({
                where: {
                    ing_cod_barras: { [Op.in]: ingressos }
                },
                attributes: ['ing_classe_ingresso']
            })
            .then(async data => {
                // Dá baixa nos estoques
                const baixaEstoque = data.map(async a => {
                    // Reduz o estoque da loja
                    await this.lojaIncrement(-1, a.ing_classe_ingresso)
                    .then(result => {
                        // O estoque não foi reduzido?
                        if(result <= 0) {
                            throw 'Falha ao dar baixa no estoque da loja, ' +
                            `classe: ${classe}`;
                        };
                    });
                });

                return await Promise.all(baixaEstoque)
                .then(() => result === ingressos.length)
            });
        });
    }

    /**
     * Confirma o recebimento dos ingressos informados.
     * 
     * @param {string[]} ingressos
     */
    async ingressoRecebido(ingressos) {
        return await this.updateStatus(ingressos, 2)
        .then(result => result === ingressos.length);
    }
}

module.exports = IngressoModel;