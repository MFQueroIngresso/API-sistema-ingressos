const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_clientes = require('./tbl_clientes');
const tbl_eventos = require('./tbl_eventos');
const tbl_pdvs = require('./tbl_pdvs');
const tbl_pos = require('./tbl_pos');
const tbl_usuarios = require('./tbl_usuarios');


/**
 * Tabela com as sangrias?
 * 
 * foreign keys:
 * - tbl_clientes (san_cliente → cli_id)
 * - tbl_eventos (san_evento → eve_cod)
 * - tbl_pdvs (san_pdv → pdv_id)
 * - tbl_pos (san_pos → pos_serie)
 * - tbl_usuarios (san_usuario → usu_id)
 */
const tbl_sangria = db_conn.define(
    'tbl_sangria',
    {
        san_codigo: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        
        san_evento: {
            type: DataTypes.INTEGER(60)
        },
        
        san_pdv: {
            type: DataTypes.INTEGER(60)
        },
        san_pos: {
            type: DataTypes.STRING(60)
        },
        
        san_cliente: {
            type: DataTypes.INTEGER(60)
        },
        
        san_usuario: {
            type: DataTypes.INTEGER(60)
        },
        
        san_data_hora: {
            type: DataTypes.DATE
        },
        
        san_valor: {
            type: DataTypes.DOUBLE(20,2)
        }
    },
    { timestamps: false }
);


// foreign keys

// tbl_clientes (san_cliente → cli_id)
tbl_clientes.hasMany(tbl_sangria, {
    foreignKey: 'san_cliente',
    sourceKey: 'cli_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangria.belongsTo(tbl_clientes, {
    foreignKey: 'san_cliente',
    targetKey: 'cli_id'
});

// tbl_eventos (san_evento → eve_cod)
tbl_eventos.hasMany(tbl_sangria, {
    foreignKey: 'san_evento',
    sourceKey: 'eve_cod',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangria.belongsTo(tbl_eventos, {
    foreignKey: 'san_evento',
    targetKey: 'eve_cod'
});

// tbl_pdvs (san_pdv → pdv_id)
tbl_pdvs.hasMany(tbl_sangria, {
    foreignKey: 'san_pdv',
    sourceKey: 'pdv_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangria.belongsTo(tbl_pdvs, {
    foreignKey: 'san_pdv',
    targetKey: 'pdv_id'
});

// tbl_pos (san_pos → pos_serie)
tbl_pos.hasMany(tbl_sangria, {
    foreignKey: 'san_pos',
    sourceKey: 'pos_serie',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangria.belongsTo(tbl_pos, {
    foreignKey: 'san_pos',
    targetKey: 'pos_serie'
});

// tbl_usuarios (san_usuario → usu_id)
tbl_usuarios.hasMany(tbl_sangria, {
    foreignKey: 'san_usuario',
    sourceKey: 'usu_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_sangria.belongsTo(tbl_usuarios, {
    foreignKey: 'san_usuario',
    targetKey: 'usu_id'
});

module.exports = tbl_sangria;