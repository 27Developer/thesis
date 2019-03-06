'use strict';

export default function (sequelize, dataTypes) {
  var insightReport = sequelize.define('InsightReport', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_report',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightReport.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightReport.belongsTo(models.RankingReport, {foreignKey: 'report_id'});
      }
    }
  });

  return insightReport;
}
