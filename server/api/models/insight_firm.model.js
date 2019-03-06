'use strict';

export default function (sequelize, dataTypes) {
  var insightFirm = sequelize.define('InsightFirm', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'insight_firm',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightFirm.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightFirm.belongsTo(models.Firm, {foreignKey: 'firm_id'});
      }
    }
  });

  return insightFirm;
}
