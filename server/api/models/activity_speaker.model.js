'use strict';

export default function (sequelize, dataTypes) {
  var activitySpeaker = sequelize.define('ActivitySpeaker', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'activity_speaker',
    timestamps: false,
    classMethods: {
      associate (models) {
        activitySpeaker.belongsTo(models.Activity, {as: 'Activity', foreignKey: 'activity_id'});
        activitySpeaker.belongsTo(models.ClientSpeaker, {foreignKey: 'speaker_id'});
      }
    }
  });

  return activitySpeaker;
}
