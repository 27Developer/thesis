'use strict';

export default function (sequelize, dataTypes) {
  var insightAnalyst = sequelize.define('InsightAnalyst', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_analyst',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightAnalyst.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightAnalyst.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
      }
    }
  });

  return insightAnalyst;
}
