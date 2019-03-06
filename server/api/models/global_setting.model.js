'use strict';
export default function (sequelize, dataTypes) {
  var global_setting = sequelize.define('GlobalSetting', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    name: dataTypes.STRING,
    last_updated: dataTypes.DATE,
    action: dataTypes.STRING,
  },
  {
    tableName: 'global_setting',
    timestamps: false,
  });
  return global_setting;
}
