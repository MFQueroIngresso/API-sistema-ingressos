// Schema do banco de dados: ticketsl_loja
/* Obs.:
    Por enquanto, somente algumas tabelas estão
    definidas no Sequelize.
*/

const lltckt_cart = require('./lltckt_cart');
const lltckt_category = require('./lltckt_category');
const lltckt_eve_categorias = require('./lltckt_eve_categorias');
const lltckt_order_product_barcode = require('./lltckt_order_product_barcode');
const lltckt_order_product = require('./lltckt_order_product');
const lltckt_order = require('./lltckt_order');
const lltckt_product = require('./lltckt_product');

/**
 * Sincroniza as tabelas do Sequelize com o MySQL
 * 
 * Obs.: As tabelas devem estar inversamente ordenadas
 *       pelas referências das foreign keys.
 * 
 * ex: lltckt_category → lltckt_eve_categorias, lltckt_category vem antes de lltckt_eve_categorias
 */
const syncModels = async () => {
    /* { alter: true } */
    await lltckt_category.sync();
    await lltckt_product.sync();
    await lltckt_cart.sync();
    await lltckt_eve_categorias.sync();
    await lltckt_order.sync();
    await lltckt_order_product.sync();
    await lltckt_order_product_barcode.sync();
}

syncModels();

module.exports = {
    lltckt_cart,
    lltckt_category,
    lltckt_eve_categorias,
    lltckt_order_product_barcode,
    lltckt_order_product,
    lltckt_order,
    lltckt_product,
}