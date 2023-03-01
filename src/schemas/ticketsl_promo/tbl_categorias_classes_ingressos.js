const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_eventos = require('./tbl_eventos');


/**
 * Tabela das categorias das classes de ingresso
 * 
 * foreign key:
 * - tbl_eventos (cat_evento → eve_cod)
 */
const tbl_categorias_classes_ingressos = db_conn.define(
    'tbl_categorias_classes_ingressos',
    {
        cat_cod: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true
        },
        
        cat_evento: {
            type: DataTypes.INTEGER(11)
        },
        
        cat_nome: {
            type: DataTypes.STRING
        },
        
        cat_data_inclusao: {
            type: DataTypes.DATE
        }
    },
    { timestamps: false }
);

// foreign key

// tbl_eventos (cat_evento → eve_cod)
tbl_eventos.hasMany(tbl_categorias_classes_ingressos, {
    foreignKey: 'cat_evento',
    sourceKey: 'eve_cod',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_categorias_classes_ingressos.belongsTo(tbl_eventos, {
    foreignKey: 'cat_evento',
    targetKey: 'eve_cod'
});

module.exports = tbl_categorias_classes_ingressos;