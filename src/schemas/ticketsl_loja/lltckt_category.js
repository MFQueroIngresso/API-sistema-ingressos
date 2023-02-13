const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');


/**
 * Tabela de categorias dos eventos (ticketsl_promo)
 */
const lltckt_category = db_conn.define(
    'lltckt_category',
    {
        category_id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        image: {
            type: DataTypes.STRING
        },
        
        parent_id: {
            type: DataTypes.INTEGER(11)
        },
        
        top: {
            type: DataTypes.TINYINT(1)
        },
        
        column: {
            type: DataTypes.INTEGER(3)
        },
        
        sort_order: {
            type: DataTypes.INTEGER(3)
        },
        
        status: {
            type: DataTypes.TINYINT(1)
        },
        
        date_added: {
            type: DataTypes.DATE
        },
        
        date_modified: {
            type: DataTypes.DATE
        },
        
        manufacturer_id: {
            type: DataTypes.INTEGER(11)
        },
        
        data_evento: {
            type: DataTypes.DATEONLY
        },
        
        local: {
            type: DataTypes.TEXT
        },
        
        local2: {
            type: DataTypes.TEXT
        },
        
        horaEvento: {
            type: DataTypes.STRING(5)
        },
        
        imageOutdoor: {
            type: DataTypes.STRING
        },
        
        censura: {
            type: DataTypes.STRING(10)
        },
        
        horaAbertura: {
            type: DataTypes.STRING(5)
        },
        
        mapa: {
            type: DataTypes.STRING
        },
        
        pontosVenda: {
            type: DataTypes.TEXT
        },
        
        data_fim_vendas: {
            type: DataTypes.DATE
        },
        
        eticket: {
            type: DataTypes.TINYINT(1)
        },
        
        facebook_pixel: {
            type: DataTypes.STRING(4000)
        },
        
        google_analytics: {
            type: DataTypes.STRING(4000)
        },
        
        data_fim_campanha: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false, schema: process.env.DB_TICKETSL_LOJA }
);

module.exports = lltckt_category;