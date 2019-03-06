'use strict';

export default function (sequelize, dataTypes) {
  var eventAnalyst = sequelize.define('EventAnalyst', {
    event_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    analyst_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
    {
      tableName: 'event_analyst',

      timestamps: false,
      classMethods: {
        associate(models) {
          eventAnalyst.belongsTo(models.Analyst,{ as: 'Analysts', foreignKey: 'analyst_id' });
          eventAnalyst.belongsTo(models.Event, { as: 'Events', foreignKey: 'event_id' });
        }
      }
    });

  return eventAnalyst;
}
