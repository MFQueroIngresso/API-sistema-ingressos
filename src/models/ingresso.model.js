const { Op } = require('sequelize');
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
        await tbl_itens_classes_ingressos.increment(
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
     * @param {string|string[]} class_id ticketsl_loja.lltckt_product.class_id
     * @returns {Promise<number>} 
     */
    async lojaIncrement(quant, class_id) {
        await lltckt_product.increment(
            { quantity: quant },
            { where: {
                classId: typeof class_id === 'string'
                    ? class_id : { [Op.in]: class_id }
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
    async validarEventoFinalizado(evento) {
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
     * @returns {Promise<number>} Total de rows alteradas
     */
    async updateStatus(ingressos, status) {
        await tbl_ingressos.update(
            { ing_status: status },
            { where: {
                ing_cod_barras: { [Op.in]: ingressos }
            }}
        )
        .then(async result => {
            // Algum ingresso não foi validado?
            if(result[0] !== ingressos.length) {
                throw `${ingressos.length - result[0]} Ingresso(s) não validado(s)`;
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
     * @param {string} pos pos_serie do POS
     */
    async createIngressos(evento, classe, quant, pos) {

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
            
            
            ing_mpgto: 1,                // mudar depois*

            ing_item_classe_ingresso: 0, //
        };

        // Verifica se o Evento já foi finalizado
        this.validarEventoFinalizado(evento);

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
        .then(async ingressos => {
            // Algum ingresso não foi registrado?
            if(ingressos.length < quant) throw 'Não foi possivel registrar todos os Ingressos';

            // Reduz o estoque do promo
            this.promoIncrement(-quant, data.ing_item_classe_ingresso)
            .then(result => {
                // O estoque não foi reduzido?
                if(result <= 0) throw 'Falha ao reservar o(s) Ingresso(s)';
            });

            // Retorna os ingressos registrados
            const codes = ingressos.map(a => a.ing_cod_barras);
            return await tbl_ingressos.findAll({
                where: {
                    ing_cod_barras: { [Op.in]: codes }
                }
            });
        });
    }

    /**
     * Valida a venda dos ingressos informados,
     * mas ainda pendente o recebimento/impressão.
     * 
     * @param {string[]} ingressos Códigos de barras dos ingressos
     */
    async validarIngressos(ingressos) {
        return await this.updateStatus(ingressos, 1)
        .then(async () => {

            // Obtêm as classes dos ingressos
            await tbl_ingressos.findAll({
                where: {
                    ing_cod_barras: { [Op.in]: ingressos }
                },
                attributes: ['ing_classe_ingresso']
            })
            .then(data => {
                data.map(async ({ ing_classe_ingresso: classe }) => {
                    // Reduz o estoque da loja
                    await this.lojaIncrement(-1, classe)
                    .then(result => {
                        // O estoque não foi reduzido?
                        if(result <= 0) {
                            throw 'Falha ao dar baixa no estoque da loja, ' +
                            `classe: ${classe}`;
                        };
                    });
                });
            });

            return true;
        });
    }

    /**
     * Confirma o recebimento dos ingressos informados.
     * 
     * @param {string[]} ingressos
     */
    async ingressoRecebido(ingressos) {
        return await this.updateStatus(ingressos, 2);
    }
}

module.exports = IngressoModel;