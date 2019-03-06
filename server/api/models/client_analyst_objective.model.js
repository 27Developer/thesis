'use strict';

export default function (sequelize, dataTypes) {
  var clientAnalystObjective = sequelize.define('ClientAnalystObjective', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    detail: dataTypes.STRING,

    update_at: dataTypes.DATE,

    create_at: dataTypes.DATE,

    is_active_record: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
      last_updated: dataTypes.DATE,
      last_updated_by: dataTypes.STRING(150)
  },
  {
    tableName: 'client_analyst_objective',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientAnalystObjective.belongsTo(models.Client, {foreignKey: 'client_id'});
        clientAnalystObjective.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
      }
    }
  });

  return clientAnalystObjective;
}
