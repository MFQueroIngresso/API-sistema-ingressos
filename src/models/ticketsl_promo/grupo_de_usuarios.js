const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela com os grupos de usuários
 */
const grupo_de_usuarios = db_conn.define(
    'grupo_de_usuarios',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },

        NOME: {
            type: DataTypes.STRING(40)
        }
    },
    { timestamps: false }
);

module.exports = grupo_de_usuarios;