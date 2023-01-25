const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela com as regras de acesso dos usuários
 */
const regra_de_acesso = db_conn.define(
    'regra_de_acesso',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },

        NOME: {
            type: DataTypes.STRING
        },

        TIPO_DE_RESTRICAO: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false }
);

module.exports = regra_de_acesso;