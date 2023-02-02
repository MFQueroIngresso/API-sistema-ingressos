// Schema do banco de dados: ticketsl_loja
/* Obs.:
    Por enquanto, somente algumas tabelas estão
    definidas no Sequelize.
*/

const lltckt_category = require('./lltckt_category');
const lltckt_eve_categorias = require('./lltckt_eve_categorias');

/**
 * Sincroniza as tabelas do Sequelize com o MySQL
 * 
 * Obs.: As tabelas devem estar inversamente ordenadas
 *       pelas referências das foreign keys.
 */
const syncModels = async () => {
    /* { alter: true } */
    await lltckt_category.sync();
    await lltckt_eve_categorias.sync();
}

syncModels();

module.exports = {
    lltckt_category,
    lltckt_eve_categorias
}