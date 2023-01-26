const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_cupons = require('./tbl_cupons');
const tbl_classes_ingressos = require('./tbl_classes_ingressos');


/**
 * Tabela ponte entre: cupons (tbl_cupons)
 * e as classes de ingressos (tbl_classes_ingressos)
 * 
 * foreign keys:
 * - tbl_cupons (cic_cupon → cupom_id)
 * - tbl_classes_ingressos (cic_classe → cla_cod)
 */
const tbl_classes_ingressos_cupons = db_conn.define(
    'tbl_classes_ingressos_cupons',
    {
        cic_cupon: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        },

        cic_classe: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_cupons (cic_cupon → cupom_id)
tbl_cupons.hasMany(tbl_classes_ingressos_cupons, {
    foreignKey: 'cic_cupon',
    sourceKey: 'cupom_id',
    onUpdate: 'no action',
    onDelete: 'cascade',
    hooks: true
});
tbl_classes_ingressos_cupons.belongsTo(tbl_cupons, {
    foreignKey: 'cic_cupon',
    targetKey: 'cupom_id'
});

// tbl_classes_ingressos (cic_classe → cla_cod)
tbl_classes_ingressos.hasMany(tbl_classes_ingressos_cupons, {
    foreignKey: 'cic_classe',
    sourceKey: 'cla_cod',
    onUpdate: 'no action',
    onDelete: 'cascade',
    hooks: true
});
tbl_classes_ingressos_cupons.belongsTo(tbl_classes_ingressos, {
    foreignKey: 'cic_classe',
    targetKey: 'cla_cod'
});

module.exports = tbl_classes_ingressos_cupons;