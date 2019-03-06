'use strict';

export default function (sequelize, dataTypes) {
  var research = sequelize.define('Research', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_update: {
      type: dataTypes.DATE,
      allowNull: true,
    },
  },
    {
      tableName: 'research',

      timestamps: false,

      classMethods: {
        associate(models) {
          research.belongsToMany(models.Analyst, { through: 'AnalystResearchCategories', foreignKey: 'research_id' });
          research.belongsToMany(models.Client, { through: 'ClientResearchCategories', foreignKey: 'research_id' });
          research.belongsToMany(models.RankingReport, { through: 'RankingReportResearch', foreignKey: 'research_id' });
          research.belongsToMany(models.Firm, { through: 'FirmResearch', foreignKey: 'research_id' });
          research.belongsToMany(models.Event, {
            as: 'Events',
            through: 'EventCategory',
            foreignKey: 'research_id'
          });

          research.belongsToMany(models.Activity, {
            as: 'Activities',
            through: 'ActivityCategory',
            foreignKey: 'category_id'
          });
          research.belongsToMany(models.Market, {
            as: 'Markets',
            through: 'MarketCategory',
            foreignKey: 'category_id'
          });
        }
      }
    });

  return research;
}
