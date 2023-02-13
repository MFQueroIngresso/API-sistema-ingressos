const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_tipo_empresas = require('./tbl_tipo_empresas');
const tbl_status = require('./tbl_status');


/**
 * Tabela das empresas
 * 
 * foreign keys:
 * - tbl_tipo_empresas (emp_tipo → tip_cod)
 * - tbl_status (emp_status → sta_id)
 */
const tbl_empresas = db_conn.define(
    'tbl_empresas',
    {
        emp_id: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },
	    
        emp_nome: {
            type: DataTypes.STRING(60)
        },

	    emp_telefone: {
            type: DataTypes.STRING(60)
        },

	    emp_endereco: {
            type: DataTypes.STRING(60)
        },

	    emp_observacao: {
            type: DataTypes.STRING(150)
        },

    	emp_data_inclusao: {
            type: DataTypes.DATE
        },

	    emp_http_site: {
            type: DataTypes.STRING(60)
        },

        emp_tipo: {
            type: DataTypes.INTEGER(60)
        },

	    emp_status: {
            type: DataTypes.SMALLINT(6)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_tipo_empresas (emp_tipo → tip_cod)
tbl_tipo_empresas.hasMany(tbl_empresas, {
    foreignKey: 'emp_tipo',
    sourceKey: 'tip_cod',
    onUpdate: 'cascade',
    onDelete: 'no action',
    hooks: true
});
tbl_empresas.belongsTo(tbl_tipo_empresas, {
    foreignKey: 'emp_tipo',
    targetKey: 'tip_cod'
});

// tbl_status (emp_status → sta_id)
tbl_status.hasMany(tbl_empresas, {
    foreignKey: 'emp_status',
    sourceKey: 'sta_id',
    onUpdate: 'restrict',
    onDelete: 'restrict',
    hooks: true
});
tbl_empresas.belongsTo(tbl_status, {
    foreignKey: 'emp_status',
    targetKey: 'sta_id'
});


module.exports = tbl_empresas;