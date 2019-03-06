'use strict';
export default function (sequelize, dataTypes) {
  var groups = sequelize.define('Groups', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    index: dataTypes.INTEGER,

    group_name: dataTypes.STRING,

    visibility: dataTypes.STRING,

    last_update: dataTypes.DATE,
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    client_id: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    firm_id: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    event_id: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    market_id: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    report_id: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    collection_id: {
      type: dataTypes.STRING,
      allowNull: true,
    }
  },
    {
      tableName: 'groups',
      timestamps: false,
      classMethods: {
        associate(models) {
          groups.belongsTo(models.ObjectTemplates, { foreignKey: 'template_id' });
          groups.hasMany(models.Items, { foreignKey: 'group_id' });
        }
      }
    });
  return groups;
}
