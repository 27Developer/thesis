'use strict';

export default function (sequelize, dataTypes) {
  var insightClient = sequelize.define('InsightClient', {
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
    tableName: 'insight_client',
    timestamps: false,
    classMethods: {
      associate (models) {
        insightClient.belongsTo(models.Insight, {foreignKey: 'insight_id'});
        insightClient.belongsTo(models.Client, {foreignKey: 'client_id'});
      }
    }
  });

  return insightClient;
}
