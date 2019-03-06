'use strict';

export default function (sequelize, dataTypes) {
  var insight = sequelize.define('Insight', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    checked_by_users: {
      type: dataTypes.STRING
    },
    created_by: {
      type: dataTypes.STRING
    },
    type: {
      type: dataTypes.INTEGER
    },
    sensitivity: {
      type: dataTypes.INTEGER
    },
    sentiment: {
      type: dataTypes.INTEGER
    },
    desc: {
      type: dataTypes.STRING
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_date: {
      type: dataTypes.DATE,
      allowNull: false,
    },
    updated_date: {
      type: dataTypes.DATE,
      allowNull: false,
    },
    published_date: {
      type: dataTypes.DATE,
      allowNull: false,
    },
    insight_status: dataTypes.BOOLEAN,
    last_updated_by: {
      type: dataTypes.STRING(150),
      allowNull: true
    },
  },
    {
      tableName: 'insight',
      timestamps: false,
      classMethods: {
        associate(models) {
          insight.belongsToMany(models.Client, {
            as: 'Clients',
            through: 'InsightClient',
            foreignKey: 'insight_id'
          });
          insight.belongsToMany(models.Analyst, {
            as: 'Analysts',
            through: 'InsightAnalyst',
            foreignKey: 'insight_id'
          });
          insight.belongsToMany(models.Firm, {
            as: 'Firms',
            through: 'InsightFirm',
            foreignKey: 'insight_id'
          });
          insight.hasMany(models.InsightAnalyst, { as: 'InsightAnalyst', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightActivity, { as: 'InsightActivity', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightClient, { as: 'InsightClient', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightReport, { as: 'InsightReport', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightCategory, { as: 'InsightCategory', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightFirm, { as: 'InsightFirm', foreignKey: 'insight_id' });
          insight.hasMany(models.InsightClientStatus, { as: 'InsightClientStatus', foreignKey: 'insight_id' });
        }
      }
    });

  return insight;
}
