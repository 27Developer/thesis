'use strict';

export default function (sequelize, dataTypes) {
  var analystHistory = sequelize.define('AnalystHistory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    insert_date: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },

    is_ranking_report_author: {
      type: dataTypes.BOOLEAN,
      allowNull: true
    },
    is_active_record: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    title: dataTypes.STRING,
    team: dataTypes.STRING,
    is_access: {
      type: dataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    },
    email: dataTypes.STRING,
    phone: dataTypes.STRING,
    twitter: dataTypes.STRING,
    city: dataTypes.STRING,
    country: dataTypes.STRING,
    state: dataTypes.STRING,
    region: dataTypes.STRING,
    ad_owner: dataTypes.STRING,
  },
  {
    tableName: 'analyst_history',
    timestamps: false,

    classMethods: {
      associate (models) {
        analystHistory.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
        analystHistory.belongsTo(models.Firm, {foreignKey: 'firm_id'});
        analystHistory.belongsTo(models.ResearchType, {foreignKey: 'research_type_id'});
        analystHistory.belongsTo(models.VendorLeaning, {foreignKey: 'vendor_leaning_id'});
      }
    }
  });

  return analystHistory;
}
