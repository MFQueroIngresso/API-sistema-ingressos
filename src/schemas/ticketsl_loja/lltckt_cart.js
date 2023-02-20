const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const lltckt_product = require('./lltckt_product');


/**
 * Tabela do carrinho de compras
 * 
 * foreign keys:
 * - lltckt_customer (customer_id → customer_id) // ligação indireta
 * - lltckt_product (product_id → product_id)
 */
const lltckt_cart = db_conn.define(
    'lltckt_cart',
    {
        cart_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        
        api_id: {
            type: DataTypes.INTEGER(11)
        },
        
        customer_id: {
            type: DataTypes.INTEGER(11)
        },
        
        session_id: {
            type: DataTypes.STRING(32)
        },
        
        product_id: {
            type: DataTypes.INTEGER(11)
        },
        
        recurring_id: {
            type: DataTypes.INTEGER(11)
        },
        
        option: {
            type: DataTypes.TEXT
        },
        
        quantity: {
            type: DataTypes.INTEGER(5)
        },
        
        date_added: {
            type: DataTypes.DATE
        },
        
        date_expired: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_LOJA }
);

// foreign keys

// lltckt_product (product_id → product_id)
lltckt_product.hasMany(lltckt_cart, {
    foreignKey: 'product_id',
    sourceKey: 'product_id',
    onUpdate: 'set null',
    onDelete: 'set null',
    hooks: true
});
lltckt_cart.belongsTo(lltckt_product, {
    foreignKey: 'product_id',
    targetKey: 'product_id'
});

module.exports = lltckt_cart;