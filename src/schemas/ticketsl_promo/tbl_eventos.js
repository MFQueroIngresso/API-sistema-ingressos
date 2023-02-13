const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_empresas = require('./tbl_empresas');
const tbl_clientes = require('./tbl_clientes');


/**
 * Tabela dos eventos
 * 
 * foreign keys:
 * - tbl_empresas (eve_empresa → emp_id)
 * - tbl_clientes (eve_cliente → cli_id)
 */
const tbl_eventos = db_conn.define(
    'tbl_eventos',
    {
        eve_cod: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

        eve_nome: {
            type: DataTypes.STRING(60)
        },

        eve_local: {
            type: DataTypes.STRING(60)
        },

        eve_inicio: {
            type: DataTypes.DATE
        },

        eve_fim: {
            type: DataTypes.DATE
        },

        eve_fim_sangria: {
            type: DataTypes.DATE
        },

        eve_frase: {
            type: DataTypes.STRING
        },

        eve_data_inclusao: {
            type: DataTypes.DATE
        },

        eve_cidade: {
            type: DataTypes.STRING(60)
        },

        eve_data: {
            type: DataTypes.DATE
        },

        eve_hora: {
            type: DataTypes.TIME
        },

        eve_empresa: {
            type: DataTypes.INTEGER(60)
        },

        eve_cliente: {
            type: DataTypes.INTEGER(60)
        },

        eve_print_via: {
            type: DataTypes.SMALLINT(2)
        },

        eve_ativo: {
            type: DataTypes.TINYINT(4)
        },

        eve_nome_pos: {
            type: DataTypes.STRING(60)
        },

        eve_taxa: {
            type: DataTypes.SMALLINT(2)
        },

        eve_logo: {
            type: DataTypes.STRING(300)
        },

        eve_mapa: {
            type: DataTypes.STRING
        },

        eve_pin_validacao: {
            type: DataTypes.STRING(8)
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_PROMO }
);

// foreign keys

// tbl_empresas (eve_empresa → emp_id)
tbl_empresas.hasMany(tbl_eventos, {
    foreignKey: 'eve_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_eventos.belongsTo(tbl_empresas, {
    foreignKey: 'eve_empresa',
    targetKey: 'emp_id'
});

// tbl_clientes (eve_cliente → cli_id)
tbl_clientes.hasMany(tbl_eventos, {
    foreignKey: 'eve_cliente',
    sourceKey: 'cli_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_eventos.belongsTo(tbl_clientes, {
    foreignKey: 'eve_cliente',
    targetKey: 'cli_id'
});

module.exports = tbl_eventos;