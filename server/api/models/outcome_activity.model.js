'use strict';

export default function (sequelize, dataTypes) {
  var outcomeActivity = sequelize.define('OutcomeActivity', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'outcome_activity',
    timestamps: false,
    classMethods: {
      associate(models) {
        outcomeActivity.belongsTo(models.Activity, { as: 'Activity', foreignKey: 'activity_id' });
        outcomeActivity.belongsTo(models.Activity, { as: 'Outcome', foreignKey: 'outcome_id' });
      }
    }
  });

  return outcomeActivity;
}
