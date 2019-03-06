'use strict';

export default function (sequelize, dataTypes) {
  var country = sequelize.define('Country', {
    code: {
      type: dataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },

    country_name: {
      type: dataTypes.STRING,
      allowNull: false
    },
  },
  {
    tableName: 'country',

    timestamps: false,

    classMethods: {
    }
  });

  return country;
}
