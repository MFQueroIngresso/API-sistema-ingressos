const { DataTypes } = require('sequelize');
const ticketsl_loja = require('./db_conn');

const { tbl_eventos } = require('../ticketsl_promo');
const lltckt_category = require('./lltckt_category');


/**
 * Tabela ponte entre: eventos (ticketsl_promo.tbl_eventos)
 * e as categorias (ticketsl_loja.lltckt_category)
 * 
 * foreign keys:
 * - ticketsl_promo.tbl_eventos (codEvePdv → eve_cod)
 * - ticketsl_loja.lltckt_category (codCatSite → category_id)
 */
const lltckt_eve_categorias = ticketsl_loja.define(
    'lltckt_eve_categorias',
    {
        codCatEve: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        codEvePdv: {
            type: DataTypes.INTEGER(11)
        },
        
        codCatSite: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false, schema: 'ticketsl_loja' }
);

// foreign keys:

// ticketsl_promo.tbl_eventos (codEvePdv → eve_cod)
tbl_eventos.hasMany(lltckt_eve_categorias, {
    foreignKey: 'codEvePdv',
    sourceKey: 'eve_cod',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_eve_categorias.belongsTo(tbl_eventos, {
    foreignKey: 'codEvePdv',
    targetKey: 'eve_cod'
});

// ticketsl_loja.lltckt_category (codCatSite → category_id)
lltckt_category.hasMany(lltckt_eve_categorias, {
    foreignKey: 'codCatSite',
    sourceKey: 'category_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_eve_categorias.belongsTo(lltckt_category, {
    foreignKey: 'codCatSite',
    targetKey: 'category_id'
});

module.exports = lltckt_eve_categorias;