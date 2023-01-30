// Conecta o schema 'ticketsl_loja' com a API pelo Sequelize

const { Sequelize } = require('sequelize');

// Variaveis para operações de busca no banco
const Op = Sequelize.Op;
const operatorsAliases = {
    $or: Op.or,
    $like: Op.like,
    $not: Op.not
}

// Define a conexão com o banco
const ticketsl_loja = new Sequelize(
    process.env.DB_TICKETSL_LOJA, //Database
    process.env.DB_LOJA_USER,  //User
    process.env.DB_LOJA_PASS,  //Password
    {
        host: process.env.DB_LOJA_HOST, // Host
        dialect: 'mysql',
        define: {
            freezeTableName: true
        },
        timezone: '-03:00', // timezone GMT-3 de Brasília
        ...operatorsAliases
    }
);

// Confere a conexão com o banco
ticketsl_loja.authenticate()
.then(() => {
    console.log('\n------------ Conectado no banco "ticketsl_loja" -------------\n')
})
.catch(() => {
    console.log('\n-------- Falha ao conectar no banco "ticketsl_loja" ---------\n')
});

module.exports = ticketsl_loja;