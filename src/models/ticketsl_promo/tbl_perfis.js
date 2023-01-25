const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

/**
 * Tabela com os perfis de usuários (tbl_usuarios)
 */
const tbl_perfis = db_conn.define(
    'tbl_perfis',
    {
        per_cod: {
            type: DataTypes.STRING(60),
            primaryKey: true
        },

        per_descricao: {
            type: DataTypes.STRING(60)
        },

        per_data_inclusao: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false }
);

module.exports = tbl_perfis;