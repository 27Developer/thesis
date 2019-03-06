'use strict';

export default function (sequelize, dataTypes) {
  var activityEvent = sequelize.define('ActivityEvent', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'activity_event',
    timestamps: false,
    classMethods: {
      associate (models) {
        activityEvent.belongsTo(models.Activity, {as: 'Activity', foreignKey: 'activity_id'});
        activityEvent.belongsTo(models.Event, {as: 'Event', foreignKey: 'event_id'});
      }
    }
  });

  return activityEvent;
}
