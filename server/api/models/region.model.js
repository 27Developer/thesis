'use strict';

export default function (sequelize, dataTypes) {
  var region = sequelize.define('Region', {
    region_name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    code: {
      type: dataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    }
  },
  {
    tableName: 'region',
    timestamps: false,
  });

  return region;
}
