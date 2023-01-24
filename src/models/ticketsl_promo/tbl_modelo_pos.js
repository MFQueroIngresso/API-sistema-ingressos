const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela com os modelos das maquininhas (POS)
 */
const tbl_modelo_pos = db_conn.define(
    'tbl_modelo_pos',
    {
        mod_cod: {
            type: DataTypes.STRING(60),
            primaryKey: true
        },

        mod_browser: {
            type: DataTypes.STRING(60)
        },

        mod_modelo: {
            type: DataTypes.STRING(60)
        },

        mod_data_inclusao: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false }
);

module.exports = tbl_modelo_pos;