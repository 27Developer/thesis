'use strict';

export default function (sequelize, dataTypes) {
  var insightActivity = sequelize.define('InsightActivity', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_activity',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightActivity.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightActivity.belongsTo(models.Activity, {foreignKey: 'activity_id'});
      }
    }
  });

  return insightActivity;
}
