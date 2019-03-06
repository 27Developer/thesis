'use strict';

export default function (sequelize, dataTypes) {
  var maturityByAnalyst = sequelize.define('MaturityByAnalyst', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING,
      allowNull: false
    },

    detail: {
      type: dataTypes.STRING,
      allowNull: false
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    clone_to: dataTypes.STRING,
  },
  {
    tableName: 'maturity_by_analyst',
    timestamps: false,
    classMethods: {
      associate (models) {
        maturityByAnalyst.belongsTo(models.Client, {as: 'Client', foreignKey: 'client_id'});
      }
    }
  });

  return maturityByAnalyst;
}
