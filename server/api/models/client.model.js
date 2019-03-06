'use strict';

export default function (sequelize, dataTypes) {
  var client = sequelize.define('Client', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false
    },

    name: dataTypes.STRING,

    origination_date: dataTypes.DATE
  },
    {
      tableName: 'client',

      timestamps: false,

      classMethods: {
        associate(models) {
          // client.belongsToMany(models.AnalystFirmSubscriptionType, {
          //   through: 'ClientAnalystFirmSubscription',
          //   foreignKey: 'client_id'
          // });
          client.hasMany(models.ClientHealthHistory, { as: 'ClientHealthHistories', foreignKey: 'client_id' });
          client.hasMany(models.ClientHealthHistoryRecent, { as: 'ClientHealthHistoriesRecent', foreignKey: 'client_id' });
          client.belongsToMany(models.Research, { through: 'ClientResearchCategories', foreignKey: 'client_id' });
          client.belongsToMany(models.Event, {
            as: 'Events',
            through: 'EventClient',
            foreignKey: 'client_id'
          });
          client.belongsToMany(models.Media, {
            as: 'Media',
            through: 'ClientMedia',
            foreignKey: 'client_id'
          });
          client.hasMany(models.Activity, { as: "Activities", foreignKey: 'client_id' });
          client.hasMany(models.SubSegmentAnalyst, { as: 'SubSegmentAnalyst', foreignKey: 'client_id' })
          client.belongsToMany(models.Insight, {
            as: 'Insights',
            through: 'InsightClient',
            foreignKey: { name: 'client_id', allowNull: true }
          });
          client.belongsToMany(models.Collection, {
            as: 'Collections',
            through: 'CollectionClient',
            foreignKey: { name: 'client_id', allowNull: true }
          });
          client.hasMany(models.ClientResearchCategories, { foreignKey: 'client_id' });
          client.belongsToMany(models.Analyst, {
            as: 'Analysts',
            through: 'SubSegmentAnalyst',
            foreignKey: 'client_id'
          });

          client.belongsToMany(models.User, {
            as: 'Assigneds',
            through: 'ClientAssigned',
            foreignKey: 'client_id'
          });
          client.belongsToMany(models.RankingReport, {
            as: 'RankingReports',
            through: 'ClientRankingReport',
            foreignKey: 'client_id'
          });
          client.hasMany(models.FirmClient, {as : 'FirmClients',  foreignKey: 'client_id' });
        }
      }
    });

  return client;
}
