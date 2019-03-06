'use strict';

export default function (sequelize, dataTypes) {
  var clientResouce = sequelize.define('ClientResouce', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    resource_name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    detail: dataTypes.STRING,

    update_at: dataTypes.DATE,

    create_at: dataTypes.DATE,

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'client_resources',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientResouce.belongsTo(models.Client, {foreignKey: 'client_id'});
      }
    }
  });

  return clientResouce;
}
