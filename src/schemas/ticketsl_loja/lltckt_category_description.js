const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const lltckt_category = require('./lltckt_category');


/**
 * Tabela com as descrições das categorias dos eventos.
 * 
 * foreign key:
 * - lltckt_category (category_id → category_id)
 */
const lltckt_category_description = db_conn.define(
    'lltckt_category_description',
    {
        category_id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        },

        language_id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING
        },

        description: {
            type: DataTypes.TEXT
        },
        
        meta_description: {
            type: DataTypes.STRING
        },

        meta_keyword: {
            type: DataTypes.STRING
        },

        release: {
            type: DataTypes.TEXT
        },

        info_local: {
            type: DataTypes.TEXT
        },

        local_mapa: {
            type: DataTypes.STRING
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_LOJA }
);

// foreign key:

// lltckt_category (category_id → category_id)
lltckt_category.hasOne(lltckt_category_description, {
    foreignKey: 'category_id',
    sourceKey: 'category_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
lltckt_category_description.belongsTo(lltckt_category, {
    foreignKey: 'category_id',
    targetKey: 'category_id'
});

module.exports = lltckt_category_description;