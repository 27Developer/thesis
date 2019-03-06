'use strict';

export default function (sequelize, dataTypes) {
  var clientAssigned = sequelize.define('ClientAssigned', {
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
    tableName: 'client_assigned',
    timestamps: true,
    underscored: true,

    classMethods: {
      associate(models) {
        clientAssigned.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id' });
        clientAssigned.belongsTo(models.User, { as: 'User', foreignKey: 'user_id' });
      }
    }
  });

  return clientAssigned;
}
