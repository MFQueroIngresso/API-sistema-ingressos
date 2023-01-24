const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_empresas = require('./tbl_empresas');


/**
 * Tabela dos clientes
 * 
 * foreign key:
 * - tbl_empresas (cli_empresa → emp_id)
 */
const tbl_clientes = db_conn.define(
    'tbl_clientes',
    {
        cli_id: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

	    cli_nome: {
            type: DataTypes.STRING(60)
        },

	    cli_telefone: {
            type: DataTypes.STRING(60)
        },

	    cli_endereco: {
            type: DataTypes.STRING(60)
        },

	    cli_observacao: {
            type: DataTypes.STRING(150)
        },

	    cli_empresa: {
            type: DataTypes.INTEGER(10)
        },

	    cli_data_inclusao: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false }
);

// foreign key

// tbl_empresas (cli_empresa → emp_id)
tbl_empresas.hasMany(tbl_clientes, {
    foreignKey: 'cli_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_clientes.belongsTo(tbl_empresas, {
    foreignKey: 'cli_empresa',
    targetKey: 'emp_id'
});

module.exports = tbl_clientes;