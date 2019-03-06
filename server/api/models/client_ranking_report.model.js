'use strict';

export default function (sequelize, dataTypes) {
  const clientRankingReport = sequelize.define('ClientRankingReport', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    status_ranking: {
      type: dataTypes.STRING(45),
      allowNull: true,
      defaultValue: null
    },
    placement: {
      type: dataTypes.STRING,
    },
    is_12month_feasible: {
      type: dataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    client_type: {
      type: dataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },
    ranking_report_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    }
  },
  {
    tableName: 'client_ranking_report',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientRankingReport.belongsTo(models.RankingReport, {foreignKey: 'ranking_report_id'});
        clientRankingReport.belongsTo(models.Client, {foreignKey: 'client_id'});
        clientRankingReport.belongsTo(models.Placement, { foreignKey: 'placement' });
        clientRankingReport.belongsTo(models.FirmPlacement, { foreignKey: 'placement'})
      }
    }
  });

  return clientRankingReport;
}
