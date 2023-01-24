const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela dos tipos de empresas
 */
const tbl_tipo_empresas = db_conn.define(
    'tbl_tipo_empresas',
    {
        tip_cod: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

	    tip_descricao: {
            type: DataTypes.STRING(60)
        },

	    tip_data_inclusao: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false }
);

module.exports = tbl_tipo_empresas;