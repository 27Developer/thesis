'use strict';

export default function (sequelize, dataTypes) {
  var effort = sequelize.define('Effort', {
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
    tableName: 'effort_cd',
    timestamps: false
  });

  return effort;
}
