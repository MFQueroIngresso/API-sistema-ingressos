const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_eventos = require('./tbl_eventos');
const tbl_clientes = require('./tbl_clientes');


/**
 * Tabela dos comprovantes de sangrias
 * 
 * foreign keys:
 * - tbl_eventos (evento_id → eve_cod)
 * - tbl_clientes (cliente_id → cli_id)
 */
const tbl_comprovante_sangria = db_conn.define(
    'tbl_comprovante_sangria',
    {
        comprovante_sangria_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },

        valor: {
            type: DataTypes.DECIMAL(10,5)
        },

        imagem: {
            type: DataTypes.STRING
        },

        evento_id: {
            type: DataTypes.INTEGER(11)
        },

        cliente_id: {
            type: DataTypes.INTEGER(11)
        },

        cadastrado_em: {
            type: 'TIMESTAMP'
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_eventos (evento_id → eve_cod)
tbl_eventos.hasMany(tbl_comprovante_sangria, {
    foreignKey: 'evento_id',
    sourceKey: 'eve_cod',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_comprovante_sangria.belongsTo(tbl_eventos, {
    foreignKey: 'evento_id',
    targetKey: 'eve_cod'
});

// tbl_clientes (cliente_id → cli_id)
tbl_clientes.hasMany(tbl_comprovante_sangria, {
    foreignKey: 'cliente_id',
    sourceKey: 'cli_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_comprovante_sangria.belongsTo(tbl_clientes, {
    foreignKey: 'cliente_id',
    targetKey: 'cli_id'
});

module.exports = tbl_comprovante_sangria;