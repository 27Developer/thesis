'use strict';

export default function(sequelize, dataTypes) {
  const rankingReport = sequelize.define('RankingReport', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },
      name: {
        type: dataTypes.STRING(250),
        allowNull: false
      },
      analysis_year: {
        type: dataTypes.STRING(4),
        allowNull: false
      },
      anticipated_publish_date: {
        type: dataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      anticipated_kickoff_date: {
        type: dataTypes.DATE,
        allowNull: true,
        defaultValue: null
      },
      // update_date: {
      //   type: dataTypes.DATE,
      //   allowNull: true,
      // },
      is_active: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      nickname: {
        type: dataTypes.STRING(100),
      },
      client_type: {
        type: dataTypes.STRING(10),
      },
      major_report: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'ranking_report',
      timestamps: false,
      classMethods: {
        associate (models) {
          rankingReport.belongsTo(models.Firm, { foreignKey: 'firm_id' });
          rankingReport.belongsTo(models.FirmPlacement, { foreignKey: 'placement' });
          rankingReport.belongsToMany(models.Research, {
            as: 'Researches',
            through: 'RankingReportResearch',
            foreignKey: 'ranking_report_id'
          });
          rankingReport.belongsToMany(models.Analyst, {
            as: 'Analysts',
            through: 'RankingReportAnalyst',
            foreignKey: 'ranking_report_id'
          });
          rankingReport.belongsToMany(models.Activity, {
            as: 'Activities',
            through: 'ActivityReport',
            foreignKey: 'report_id'
          });
          rankingReport.hasMany(models.RankingReportResearch, { foreignKey: 'ranking_report_id' });
          rankingReport.belongsToMany(models.Client, {
            as: 'Clients',
            through: 'ClientRankingReport',
            foreignKey: 'ranking_report_id'
          });
        }
      }
    });

  return rankingReport;
}
