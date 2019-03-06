'use strict';

export default function (sequelize, dataTypes) {
  var tableConfig = sequelize.define('TableConfig', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    table_name: {
      type: dataTypes.STRING,
    },

    column_name: {
      type: dataTypes.STRING,
    },
    email: {
      type: dataTypes.STRING,
    },
  },
  {
    tableName: 'table_config',

    timestamps: false,

    classMethods: {}
  });

  return tableConfig;
}
