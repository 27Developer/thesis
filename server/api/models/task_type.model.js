'use strict';

export default function (sequelize, dataTypes) {
  var taskType = sequelize.define('TaskType', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING(50),
      allowNull: true
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    kind: {
      type: dataTypes.STRING,
      allowNull: true
    },
    index: {
      type: dataTypes.INTEGER,
      allowNull: true
    },
  },
  {
    tableName: 'task_type',
    timestamps: false,
    classMethods: {
      associate(models) {
        taskType.hasMany(models.Note, { as: 'Notes', foreignKey: 'activity_type' });
      }
    }
  });

  return taskType;
}
