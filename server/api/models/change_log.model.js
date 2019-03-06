'use strict';

export default function(sequelize, dataTypes) {
  var changeLog = sequelize.define('ChangeLog', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },

      section: dataTypes.STRING,

      summary: dataTypes.STRING,

      user: dataTypes.STRING,

      date: dataTypes.DATE,

      page: dataTypes.STRING,

      object_id: dataTypes.STRING,

      group_id: dataTypes.STRING,

      old_value: dataTypes.STRING,

    },
    {
      tableName: 'change_log',

      timestamps: false,

      classMethods: {}
    });

  return changeLog;
}
