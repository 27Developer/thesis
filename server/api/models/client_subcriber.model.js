'use strict';

export default function (sequelize, dataTypes) {
  var clientSubcriber = sequelize.define('ClientSubcriber', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },

    user_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'client_subcriber',
    timestamps: true,
    underscored: true,

    classMethods: {
      associate(models) {
        clientSubcriber.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id' });
        clientSubcriber.belongsTo(models.User, { as: 'User', foreignKey: 'user_id' });
      }
    }
  });

  return clientSubcriber;
}
