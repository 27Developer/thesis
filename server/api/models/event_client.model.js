'use strict';

export default function (sequelize, dataTypes) {
  var eventClient = sequelize.define('EventClient', {
    event_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
    {
      tableName: 'event_client',

      timestamps: false,

      classMethods: {
        associate(models) {
          eventClient.belongsTo(models.Client, { as: 'Clients', foreignKey: 'client_id' });
          eventClient.belongsTo(models.Event, { as: 'Events', foreignKey: 'event_id' });
        }
      }
    });

  return eventClient;
}
