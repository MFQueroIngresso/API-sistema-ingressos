const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela de numeração das classes dos ingressos?
 */
const tbl_classe_numeracao = db_conn.define(
    'tbl_classe_numeracao',
    {
        cln_cod: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },

        clg_cod: {
            type: DataTypes.INTEGER(11),
            unique: false// true
        },

        eve_cod: {
            type: DataTypes.INTEGER(60)
        },

        cla_cod: {
            type: DataTypes.INTEGER(60)
        },

        cln_num: {
            type: DataTypes.STRING
        },

        cln_disp: {
            type: DataTypes.TINYINT(1),
            unique: false// true
        },

        cln_lock_pos: {
            type: DataTypes.STRING
        },

        cln_lock_expr: {
            type: DataTypes.DATE
        },

        cln_texto_impresso: {
            type: DataTypes.STRING
        },

        cln_texto_pos: {
            type: DataTypes.STRING
        },

        cln_mapa_id: {
            type: DataTypes.STRING
        },

        cln_cortesia: {
            type: DataTypes.TINYINT(1)
        }
    },
    { timestamps: false }
);

module.exports = tbl_classe_numeracao;