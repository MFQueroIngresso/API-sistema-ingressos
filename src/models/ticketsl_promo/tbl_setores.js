const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela do setor dos ingressos
 * 
 * @deprecated ?
 */
const tbl_setores = db_conn.define(
    'tbl_setores',
    {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        nome: {
            type: DataTypes.STRING(99)
        },

        cadastrado_em: {
            type: 'TIMESTAMP'
        }
    },
    { timestamps: false }
);

module.exports = tbl_setores;