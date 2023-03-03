const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_classes_ingressos = require('./tbl_classes_ingressos');
//const { lltckt_product } = require('../ticketsl_loja');


/**
 * Tabela dos ingressos solidários
 * 
 * foreign keys:
 * - ticketsl_promo.tbl_classes_ingressos (cis_cod_classe_ingresso → cla_cod)
 * - \* ticketsl_loja.lltckt_product (cis_product_id → product_id)
 */
const tbl_classe_ingressos_solidario = db_conn.define(
    'tbl_classe_ingressos_solidario',
    {
        cis_cod: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        cis_product_id: {
            type: DataTypes.INTEGER(11)
        },
        
        cis_cod_classe_ingresso: {
            type: DataTypes.INTEGER(11)
        },
        
        cis_nome: {
            type: DataTypes.STRING
        },
        
        cis_valor: {
            type: DataTypes.FLOAT
        },
        
        cis_quantidade: {
            type: DataTypes.INTEGER(11)
        },
        
        cis_observacao: {
            type: DataTypes.STRING
        },
        
        cis_percentual: {
            type: DataTypes.FLOAT
        },
        
        cis_percentual_desconto: {
            type: DataTypes.FLOAT
        },
        
        cis_exibe_site: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_PROMO }
);

// foreign keys

// ticketsl_promo.tbl_classes_ingressos (cis_cod_classe_ingresso → cla_cod)
tbl_classes_ingressos.hasMany(tbl_classe_ingressos_solidario, {
    foreignKey: 'cis_cod_classe_ingresso',
    sourceKey: 'cla_cod',
    onUpdate: 'set null',
    onDelete: 'set null',
    hooks: true
});
tbl_classe_ingressos_solidario.belongsTo(tbl_classes_ingressos, {
    foreignKey: 'cis_cod_classe_ingresso',
    targetKey: 'cla_cod'
});

// ticketsl_loja.lltckt_product (cis_product_id → product_id)
/* lltckt_product.hasMany(tbl_classe_ingressos_solidario, {
    foreignKey: 'cis_product_id',
    sourceKey: 'product_id',
    onUpdate: 'set null',
    onDelete: 'set null',
    hooks: true
});
tbl_classe_ingressos_solidario.belongsTo(lltckt_product, {
    foreignKey: 'cis_product_id',
    targetKey: 'product_id'
}); */

module.exports = tbl_classe_ingressos_solidario;