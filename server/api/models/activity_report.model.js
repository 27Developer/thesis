'use strict';

export default function (sequelize, dataTypes) {
  var activityReport = sequelize.define('ActivityReport', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'activity_report',
    timestamps: false,
    classMethods: {
      associate (models) {
        activityReport.belongsTo(models.Activity, {as: 'Activity', foreignKey: 'activity_id'});
        activityReport.belongsTo(models.RankingReport, { foreignKey: 'report_id'});
      }
    }
  });

  return activityReport;
}
