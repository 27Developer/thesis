'use strict';

export default function (sequelize, dataTypes) {
  var clientObjective = sequelize.define('ClientObjective', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    detail: dataTypes.STRING,

    update_at: dataTypes.DATE,

    create_at: dataTypes.DATE,

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_updated: dataTypes.DATE,
    last_updated_by: dataTypes.STRING(150)
  },
  {
    tableName: 'client_objective',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientObjective.belongsTo(models.Client, {foreignKey: 'client_id'});
        clientObjective.belongsTo(models.Objective, {foreignKey: 'objective_id'});
      }
    }
  });

  return clientObjective;
}
