'use strict';

export default function (sequelize, dataTypes) {
  var insightCategory = sequelize.define('InsightCategory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_category',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightCategory.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightCategory.belongsTo(models.Research, {foreignKey: 'category_id'});
      }
    }
  });

  return insightCategory;
}
