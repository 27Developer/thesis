'use strict';

export default function (sequelize, dataTypes) {
  var rankingReportResearch = sequelize.define('RankingReportResearch', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'ranking_report_research',
    timestamps: false,
    classMethods: {
      associate (models) {
        rankingReportResearch.belongsTo(models.RankingReport, { foreignKey: 'ranking_report_id' });
        rankingReportResearch.belongsTo(models.Research, { foreignKey: 'research_id' });
      }
    }
  });
  return rankingReportResearch;
}
