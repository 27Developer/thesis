'use strict';

export default function (sequelize, dataTypes) {
  var insightClientStatus = sequelize.define('InsightClientStatus', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    publish: dataTypes.BOOLEAN,
    star: dataTypes.BOOLEAN,
  },
  {
    tableName: 'insight_client_status',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightClientStatus.belongsTo(models.Insight, { as: 'Insight', foreignKey: 'insight_id'});
        insightClientStatus.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id'});
      }
    }
  });

  return insightClientStatus;
}
