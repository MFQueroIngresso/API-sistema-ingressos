const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_pdvs = require('./tbl_pdvs');
const tbl_eventos = require('./tbl_eventos');
const tbl_empresas = require('./tbl_empresas');


/**
 * Tabela ponte entre:
 * - PDVs (tbl_pdvs);
 * - Eventos (tbl_eventos); e
 * - Empresas (tbl_empresas).
 * 
 * foreign keys:
 * - tbl_pdvs (evp_pdv → pdv_id)
 * - tbl_eventos (evp_evento → eve_cod)
 * - tbl_empresas (evp_empresa → emp_id)
 */
const tbl_eventos_pdvs = db_conn.define(
    'tbl_eventos_pdvs',
    {
        evp_id: {
            type: DataTypes.INTEGER(10),
            autoIncrement: true,
            primaryKey: true
        },

        evp_pdv: {
            type: DataTypes.INTEGER(60)
        },

        evp_evento: {
            type: DataTypes.INTEGER(60)
        },

        evp_empresa: {
            type: DataTypes.INTEGER(60)
        },

        evp_taxa: {
            type: DataTypes.TINYINT(1)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_pdvs (evp_pdv → pdv_id)
tbl_pdvs.hasMany(tbl_eventos_pdvs, {
    foreignKey: 'evp_pdv',
    sourceKey: 'pdv_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_eventos_pdvs.belongsTo(tbl_pdvs, {
    foreignKey: 'evp_pdv',
    targetKey: 'pdv_id'
});

// tbl_eventos (evp_evento → eve_cod)
tbl_eventos.hasMany(tbl_eventos_pdvs, {
    foreignKey: 'evp_evento',
    sourceKey: 'eve_cod',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_eventos_pdvs.belongsTo(tbl_eventos, {
    foreignKey: 'evp_evento',
    targetKey: 'eve_cod'
});

// tbl_empresas (evp_empresa → emp_id)
tbl_empresas.hasMany(tbl_eventos_pdvs, {
    foreignKey: 'evp_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_eventos_pdvs.belongsTo(tbl_empresas, {
    foreignKey: 'evp_empresa',
    targetKey: 'emp_id'
});

module.exports = tbl_eventos_pdvs;