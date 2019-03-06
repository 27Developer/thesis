'use strict';

export default function (sequelize, dataTypes) {
  var activityCategory = sequelize.define('ActivityCategory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'activity_category',
    timestamps: false,
    classMethods: {
      associate (models) {
        activityCategory.belongsTo(models.Activity, {as: 'Activity', foreignKey: 'activity_id'});
        activityCategory.belongsTo(models.Research, {foreignKey: 'category_id'});
      }
    }
  });

  return activityCategory;
}
