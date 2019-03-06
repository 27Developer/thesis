'use strict';

export default function (sequelize, dataTypes) {
  var clientAnalystAlignmentHistory = sequelize.define('ClientAnalystAlignmentHistory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: dataTypes.BOOLEAN,

    insert_date: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    influence: dataTypes.STRING,
  },
  {
    tableName: 'client_analyst_alignment_history',

    timestamps: false,

    classMethods: {
      associate (models) {
        clientAnalystAlignmentHistory.belongsTo(models.Client, {foreignKey: 'client_id'});
        clientAnalystAlignmentHistory.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
        clientAnalystAlignmentHistory.belongsTo(models.ImportanceByAnalystCd, {foreignKey: 'importance_cd'});
        clientAnalystAlignmentHistory.belongsTo(models.MaturityByAnalyst, {foreignKey: 'maturity_id'});
      }
    }
  });

  return clientAnalystAlignmentHistory;
}
