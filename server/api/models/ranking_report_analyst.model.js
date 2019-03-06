'use strict';

export default function (sequelize, dataTypes) {
  var rankingReportAnalyst = sequelize.define('RankingReportAnalyst', {
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
    tableName: 'ranking_report_analyst',
    timestamps: false,
    classMethods: {
      associate (models) {
        rankingReportAnalyst.belongsTo(models.RankingReport, { foreignKey: 'ranking_report_id' });
        rankingReportAnalyst.belongsTo(models.Analyst, { foreignKey: 'analyst_id' });
      }
    }
  });

  return rankingReportAnalyst;
}
