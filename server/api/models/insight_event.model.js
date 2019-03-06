'use strict';

export default function (sequelize, dataTypes) {
  var insightEvent = sequelize.define('InsightEvent', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_event',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightEvent.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightEvent.belongsTo(models.Event, {foreignKey: 'event_id'});
      }
    }
  });

  return insightEvent;
}
