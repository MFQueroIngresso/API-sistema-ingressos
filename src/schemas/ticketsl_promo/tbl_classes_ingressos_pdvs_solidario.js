const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_pdvs = require('./tbl_pdvs');
const tbl_classe_ingressos_solidario = require('./tbl_classe_ingressos_solidario');


/**
 * Tabela ponte entre: pdvs (tbl_pdvs) e
 * os ingressos solidários (tbl_classe_ingressos_solidario)
 * 
 * foreign keys:
 * - tbl_pdvs (cipc_pdv → pdv_id)
 * - tbl_classe_ingressos_solidario (cipc_classe_ingresso → cis_cod_classe_ingresso)
 */
const tbl_classes_ingressos_pdvs_solidario = db_conn.define(
    'tbl_classes_ingressos_pdvs_solidario',
    {
        cipc_pdv: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        },

        cipc_classe_ingresso: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_PROMO }
);

// foreign keys

// tbl_pdvs (cipc_pdv → pdv_id)
tbl_pdvs.hasMany(tbl_classes_ingressos_pdvs_solidario, {
    foreignKey: 'cipc_pdv',
    sourceKey: 'pdv_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_classes_ingressos_pdvs_solidario.belongsTo(tbl_pdvs, {
    foreignKey: 'cipc_pdv',
    targetKey: 'pdv_id'
});

// tbl_classe_ingressos_solidario (cipc_classe_ingresso → cis_cod_classe_ingresso)
tbl_classe_ingressos_solidario.hasMany(tbl_classes_ingressos_pdvs_solidario, {
    foreignKey: 'cipc_classe_ingresso',
    sourceKey: 'cis_cod_classe_ingresso',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_classes_ingressos_pdvs_solidario.belongsTo(tbl_classe_ingressos_solidario, {
    foreignKey: 'cipc_classe_ingresso',
    targetKey: 'cis_cod_classe_ingresso'
});

module.exports = tbl_classes_ingressos_pdvs_solidario;