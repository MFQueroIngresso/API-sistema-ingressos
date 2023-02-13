const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const lltckt_order = require('./lltckt_order');
const lltckt_product = require('./lltckt_product');


/**
 * ...
 * 
 * foreign keys:
 * - lltckt_order (order_id → order_id)
 * - lltckt_product (product_id → product_id)
 */
const lltckt_order_product = db_conn.define(
    'lltckt_order_product',
    {
        order_product_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        order_id: {
            type: DataTypes.INTEGER(11)
        },
        
        product_id: {
            type: DataTypes.INTEGER(11)
        },
        
        name: {
            type: DataTypes.STRING
        },
        
        model: {
            type: DataTypes.STRING(64)
        },
        
        quantity: {
            type: DataTypes.INTEGER(4)
        },
        
        price: {
            type: DataTypes.DECIMAL(15,4)
        },
        
        total: {
            type: DataTypes.DECIMAL(15,4)
        },
        
        tax: {
            type: DataTypes.DECIMAL(15,4)
        },
        
        reward: {
            type: DataTypes.INTEGER(8)
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_LOJA }
);

// foreign keys

// lltckt_order (order_id → order_id)
lltckt_order.hasMany(lltckt_order_product, {
    foreignKey: 'order_id',
    sourceKey: 'order_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_order_product.belongsTo(lltckt_order, {
    foreignKey: 'order_id',
    targetKey: 'order_id'
});

// lltckt_product (product_id → product_id)
lltckt_product.hasMany(lltckt_order_product, {
    foreignKey: 'product_id',
    sourceKey: 'product_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_order_product.belongsTo(lltckt_product, {
    foreignKey: 'product_id',
    targetKey: 'product_id'
});


module.exports = lltckt_order_product;