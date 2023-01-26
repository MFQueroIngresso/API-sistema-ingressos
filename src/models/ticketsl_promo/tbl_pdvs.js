const { DataTypes } = require('sequelize');
const db_conn = require('./db_conn');

const tbl_clientes = require('./tbl_clientes');
const tbl_empresas = require('./tbl_empresas');


/**
 * Tabela dos PDVs (Pontos de Venda)
 * 
 * foreign keys:
 * - tbl_clientes (pdv_cliente → cli_id)
 * - tbl_empresas (pdv_empresa → emp_id)
 */
const tbl_pdvs = db_conn.define(
    'tbl_pdvs',
    {
        pdv_id: {
            type: DataTypes.INTEGER(60),
            autoIncrement: true,
            primaryKey: true
        },

	    pdv_nome: {
            type: DataTypes.STRING(60)
        },

	    pdv_endereco: {
            type: DataTypes.STRING(60)
        },
        
        pdv_telefone: {
            type: DataTypes.STRING(60)
        },
    
	    pdv_observacao: {
            type: DataTypes.STRING(150)
        },
        
	    pdv_data_inclusao: {
            type: DataTypes.DATE
        },

	    pdv_cliente: {
            type: DataTypes.INTEGER(60)
        },

	    pdv_empresa: {
            type: DataTypes.INTEGER(60)
        },

	    pdv_cartao: {
            type: DataTypes.INTEGER(1),
            unique: true
        },

	    pdv_login: {
            type: DataTypes.STRING(300)
        }, 
	
        pdv_senha: {
            type: DataTypes.STRING(300)
        },

	    pdv_ativo: {
            type: DataTypes.TINYINT(1)
        },
	
        pdv_tipo: {
            type: DataTypes.INTEGER(1)
        }, 
	
        pos_ativacao_smart_card: {
            type: DataTypes.STRING
        }, 
	
        pos_password: {
            type: DataTypes.STRING
        }, 
	
        pos_quantidade_parcela: {
            type: DataTypes.INTEGER(11)
        }, 
	
        pos_percentual_taxa: {
            type: DataTypes.INTEGER(11)
        }
    },
    { timestamps: false }
);

// foreign keys

// tbl_clientes (pdv_cliente → cli_id)
tbl_clientes.hasMany(tbl_pdvs, {
    foreignKey: 'pdv_cliente',
    sourceKey: 'cli_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_pdvs.belongsTo(tbl_clientes, {
    foreignKey: 'pdv_cliente',
    targetKey: 'cli_id'
});

// tbl_empresas (pdv_empresa → emp_id)
tbl_empresas.hasMany(tbl_pdvs, {
    foreignKey: 'pdv_empresa',
    sourceKey: 'emp_id',
    onUpdate: 'cascade',
    onDelete: 'cascade',
    hooks: true
});
tbl_pdvs.belongsTo(tbl_empresas, {
    foreignKey: 'pdv_empresa',
    targetKey: 'emp_id'
});

module.exports = tbl_pdvs;