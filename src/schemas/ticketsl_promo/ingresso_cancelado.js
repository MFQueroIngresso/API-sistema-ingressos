const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_ingressos = require('./tbl_ingressos');
const usuario = require('./usuario');


/**
 * Tabela com os ingressos cancelados
 * 
 * foreign keys:
 * - tbl_ingressos (INGRESSO → ing_cod_barras)
 * - usuario (USUARIO → CODIGO)
 */
const ingresso_cancelado = db_conn.define(
    'ingresso_cancelado',
    {
        CODIGO: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        
        DATA: {
            type: 'TIMESTAMP'
        },
        
        USUARIO: {
            type: DataTypes.INTEGER(11),
            unique: false//
        },
        
        INGRESSO: {
            type: DataTypes.DECIMAL(60,0)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_ingressos (INGRESSO → ing_cod_barras)
tbl_ingressos.hasMany(ingresso_cancelado, {
    foreignKey: 'INGRESSO',
    sourceKey: 'ing_cod_barras',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
ingresso_cancelado.belongsTo(tbl_ingressos, {
    foreignKey: 'INGRESSO',
    targetKey: 'ing_cod_barras'
});

// usuario (USUARIO → CODIGO)
usuario.hasMany(ingresso_cancelado, {
    foreignKey: 'USUARIO',
    sourceKey: 'CODIGO',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
ingresso_cancelado.belongsTo(usuario, {
    foreignKey: 'USUARIO',
    targetKey: 'CODIGO'
});

module.exports = ingresso_cancelado;