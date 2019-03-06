'use strict';

export default function (sequelize, dataTypes) {
  var objective = sequelize.define('Objective', {
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

    update_at: dataTypes.DATE,

    create_at: dataTypes.DATE
  },
  {
    tableName: 'objective',

    timestamps: false,

    classMethods: {
      associate (models) {
        objective.belongsTo(models.Client, { foreignKey: 'client_id' });
      }
    }
  });

  return objective;
}
