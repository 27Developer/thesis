'use strict';

export default function (sequelize, dataTypes) {
  var cohort = sequelize.define('Cohort', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'cohort',
    timestamps: false
  });

  return cohort;
}
