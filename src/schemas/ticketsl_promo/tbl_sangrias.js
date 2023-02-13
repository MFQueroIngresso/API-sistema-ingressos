const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_pdvs = require('./tbl_pdvs');
const tbl_eventos = require('./tbl_eventos');
const tbl_usuarios = require('./tbl_usuarios');


/**
 * Tabela com as sangrias dos PDVs?
 * 
 * foreign keys:
 * - tbl_pdvs (pdv_id → pdv_id)
 * - tbl_eventos (eve_cod → eve_cod)
 * - tbl_usuarios (usu_id → usu_id)
 */
const tbl_sangrias = db_conn.define(
    'tbl_sangrias',
    {
        id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        pdv_id: {
            type: DataTypes.INTEGER(11)
        },
        
        valor: {
            type: DataTypes.FLOAT
        },
        
        data: {
            type: DataTypes.DATE
        },
        
        eve_cod: {
            type: DataTypes.INTEGER(11)
        },
        
        usu_id: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_pdvs (pdv_id → pdv_id)
tbl_pdvs.hasMany(tbl_sangrias, {
    foreignKey: 'pdv_id',
    sourceKey: 'pdv_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangrias.belongsTo(tbl_pdvs, {
    foreignKey: 'pdv_id',
    targetKey: 'pdv_id'
});

// tbl_eventos (eve_cod → eve_cod)
tbl_eventos.hasMany(tbl_sangrias, {
    foreignKey: 'eve_cod',
    sourceKey: 'eve_cod',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangrias.belongsTo(tbl_eventos, {
    foreignKey: 'eve_cod',
    targetKey: 'eve_cod'
});

// tbl_usuarios (usu_id → usu_id)
tbl_usuarios.hasMany(tbl_sangrias, {
    foreignKey: 'usu_id',
    sourceKey: 'usu_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangrias.belongsTo(tbl_usuarios, {
    foreignKey: 'usu_id',
    targetKey: 'usu_id'
});

module.exports = tbl_sangrias;