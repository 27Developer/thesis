'use strict';

export default function(sequelize, dataTypes) {
  var analyst = sequelize.define('Analyst', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    name: {
      type: dataTypes.STRING(150),
      allowNull: true
    }
  }, {
    tableName: 'analyst',
    timestamps: false,
    classMethods: {
      associate(models) {
        analyst.belongsToMany(models.Research, {through: 'AnalystResearchCategories', foreignKey: 'analyst_id'});
        analyst.belongsToMany(models.RankingReport, {
          as: 'RankingReports',
          through: 'RankingReportAnalyst',
          foreignKey: 'analyst_id'
        });
        analyst.hasMany(models.ClientAnalystAlignmentHistory, { foreignKey: 'analyst_id' });
        //analyst.hasMany(models.AnalystHistory, { foreignKey: 'analyst_id' });
        analyst.belongsToMany(models.SubSegment, {
          as: 'SubSegment',
          through: 'SubSegmentAnalyst',
          foreignKey: 'analyst_id'
        });
        analyst.belongsToMany(models.Firm, {
          as: 'Firm',
          through: 'AnalystHistory',
          foreignKey: 'analyst_id'
        });
        //analyst.hasMany(models.AnalystMedia, { foreignKey: 'analyst_id' });
        analyst.hasMany(models.SubSegmentAnalyst, { as: 'SubSegmentAnalyst', foreignKey: 'analyst_id' });
        analyst.belongsToMany(models.Event, {
          as: 'Events',
          through: 'EventAnalyst',
          foreignKey: 'analyst_id'
        });
        analyst.belongsToMany(models.Media, {
          as: 'Media',
          through: 'AnalystMedia',
          foreignKey: {name: 'analyst_id', allowNull: true}
        });
        
        analyst.belongsToMany(models.Activity, {
          as: 'Activities',
          through: 'ActivityAnalyst',
          foreignKey: 'analyst_id'
        });
        analyst.hasMany(models.AnalystHistory,{as: 'AnalystHistory',foreignKey: 'analyst_id'})
        analyst.belongsToMany(models.Insight, {
          as: 'Insights',
          through: 'InsightAnalyst',
          foreignKey: 'analyst_id'
        });
        analyst.hasMany(models.AnalystResearchCategories,{foreignKey: 'analyst_id'})
        analyst.belongsToMany(models.Client, {
          as: 'Clients',
          through: 'SubSegmentAnalyst',
          foreignKey: 'analyst_id'
        });
      }
    }
  });

  return analyst;
}
