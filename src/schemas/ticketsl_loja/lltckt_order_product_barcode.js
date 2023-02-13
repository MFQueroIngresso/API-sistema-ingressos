const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const { tbl_ingressos } = require('../ticketsl_promo');
const lltckt_order_product = require('./lltckt_order_product');


/**
 * Tabela ponte entre: ticketsl_promo.tbl_ingressos
 * e ticketsl_loja.lltckt_order_product
 * 
 * foreign keys:
 * - ticketsl_promo.tbl_ingressos (barcode → ing_cod_barras)
 * - ticketsl_loja.lltckt_order_product (order_product_id → order_product_id)
 */
const lltckt_order_product_barcode = db_conn.define(
    'lltckt_order_product_barcode',
    {
        barcode: {
            type: DataTypes.DECIMAL(60,0),
            primaryKey: true
        },

        order_product_id: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_LOJA }
);

// foreign keys

// ticketsl_promo.tbl_ingressos (barcode → ing_cod_barras)
tbl_ingressos.hasOne(lltckt_order_product_barcode, {
    foreignKey: 'barcode',
    sourceKey: 'ing_cod_barras',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_order_product_barcode.belongsTo(tbl_ingressos, {
    foreignKey: 'barcode',
    targetKey: 'ing_cod_barras'
});

// ticketsl_loja.lltckt_order_product (order_product_id → order_product_id)
lltckt_order_product.hasMany(lltckt_order_product_barcode, {
    foreignKey: 'order_product_id',
    sourceKey: 'order_product_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_order_product_barcode.belongsTo(lltckt_order_product, {
    foreignKey: 'order_product_id',
    targetKey: 'order_product_id'
});

module.exports = lltckt_order_product_barcode;