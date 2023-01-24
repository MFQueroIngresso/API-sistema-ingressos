// Conecta o schema 'ticketsl_promo' com a API pelo Sequelize

const Sequelize = require('sequelize');

// Variaveis para operações de busca no banco
const Op = Sequelize.Op;
const operatorsAliases = {
    $or: Op.or,
    $like: Op.like,
    $not: Op.not
}

// Define a conexão com o banco
const ticketsl_promo = new Sequelize(
    process.env.DB_TICKETSL_PROMO, //Database
    process.env.DB_USER,  //User
    process.env.DB_PASS,  //Password
    {
        host: process.env.DB_HOST, // Host
        dialect: 'mysql',
        define: {
            freezeTableName: true
        },
        timezone: '-03:00', // timezone GMT-3 de Brasília
        ...operatorsAliases
    }
);

// Confere a conexão com o banco
ticketsl_promo.authenticate()
.then(() => {
    console.log('\n------------ Conectado no banco "ticketsl_promo" ------------\n')
})
.catch(() => {
    console.log('\n-------- Falha ao conectar no banco "ticketsl_promo" --------\n')
});

module.exports = ticketsl_promo;