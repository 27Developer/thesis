'use strict';

export default function (sequelize, dataTypes) {
  var activityAnalyst = sequelize.define('ActivityAnalyst', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'activity_analyst',
    timestamps: false,
    classMethods: {
      associate (models) {
        activityAnalyst.belongsTo(models.Activity, {as: 'Activity', foreignKey: 'activity_id'});
        activityAnalyst.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
      }
    }
  });

  return activityAnalyst;
}
