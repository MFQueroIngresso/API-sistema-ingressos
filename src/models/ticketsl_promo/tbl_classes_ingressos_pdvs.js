const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_pdvs = require('./tbl_pdvs');
const tbl_classes_ingressos = require('./tbl_classes_ingressos');


/**
 * Tabela ponte entre: PDVs (tbl_pdvs) e as classes de ingressos (tbl_classes_ingressos)
 * 
 * foreign keys:
 * - tbl_pdvs (cip_pdv → pdv_id)
 * - tbl_classes_ingressos (cip_classe_ingresso → cla_cod)
 */
const tbl_classes_ingressos_pdvs = db_conn.define(
    'tbl_classes_ingressos_pdvs',
    {
        cip_pdv: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        },

        cip_classe_ingresso: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_pdvs (cip_pdv → pdv_id)
tbl_pdvs.hasMany(tbl_classes_ingressos_pdvs, {
    foreignKey: 'cip_pdv',
    sourceKey: 'pdv_id',
    onUpdate: 'no action',
    onDelete: 'no action',
    hooks: true
});
tbl_classes_ingressos_pdvs.belongsTo(tbl_pdvs, {
    foreignKey: 'cip_pdv',
    targetKey: 'pdv_id'
});

// tbl_classes_ingressos (cip_classe_ingresso → cla_cod)
tbl_classes_ingressos.hasMany(tbl_classes_ingressos_pdvs, {
    foreignKey: 'cip_classe_ingresso',
    sourceKey: 'cla_cod',
    onUpdate: 'no action',
    onDelete: 'no action',
    hooks: true
});
tbl_classes_ingressos_pdvs.belongsTo(tbl_classes_ingressos, {
    foreignKey: 'cip_classe_ingresso',
    targetKey: 'cla_cod'
});

module.exports = tbl_classes_ingressos_pdvs;