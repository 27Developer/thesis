'use strict';

export default function(sequelize, dataTypes) {
  var log = sequelize.define('ActivityLog', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },
      parent_object_id: dataTypes.STRING,

      parent_object_model: dataTypes.STRING,

      object_id: dataTypes.STRING,

      object_model: dataTypes.STRING,

      new_value: dataTypes.STRING,

      old_value: dataTypes.STRING,

      user: dataTypes.STRING,

      data_model: dataTypes.STRING,

      object_group_id: dataTypes.STRING,

      page: dataTypes.STRING,

      section: dataTypes.STRING,

      object_meta_data: dataTypes.STRING,

      update_date: dataTypes.DATE,

      log_type: dataTypes.INTEGER
    },
    {
      tableName: 'activity_log',

      timestamps: false,

      classMethods: {}
    });

  return log;
}
