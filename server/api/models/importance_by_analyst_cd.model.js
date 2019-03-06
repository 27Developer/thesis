'use strict';

export default function (sequelize, dataTypes) {
  var importanceByAnalystCd = sequelize.define('ImportanceByAnalystCd', {
    code: {
      type: dataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },

    desc: {
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
    tableName: 'importance_by_analyst_cd',
    timestamps: false
  });

  return importanceByAnalystCd;
}
