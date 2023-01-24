const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela de status
 */
const tbl_status = db_conn.define(
    'tbl_status',
    {
        sta_id: {
            type: DataTypes.SMALLINT(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        sta_status: {
            type: DataTypes.STRING(60)
        },

        sta_descricao: {
            type: DataTypes.STRING(60)
        }
    },
    { timestamps: false }
);

module.exports = tbl_status;