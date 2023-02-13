const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela com os meios de pagamento
 */
const tbl_meio_pgto = db_conn.define(
    'tbl_meio_pgto',
    {
        mpg_codigo: {
            type: DataTypes.INTEGER(10),
            unique: true,
            primaryKey: true
        },

        mpg_nome: {
            type: DataTypes.STRING(10)
        }
    },
    { timestamps: false }
);

module.exports = tbl_meio_pgto;