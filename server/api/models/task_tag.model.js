'use strict';

export default function(sequelize, dataTypes) {
  var taskTag = sequelize.define('TaskTag', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    task_id: {
      type: dataTypes.STRING(36),
      allowNull: false
    },
    tag_id: {
      type: dataTypes.STRING(36),
      allowNull: false
    }
  },
  {
    tableName: 'task_tag',
    timestamps: false,
    classMethods: {
      associate (models) {
        taskTag.belongsTo(models.Task, { foreignKey: 'task_id' });
        taskTag.belongsTo(models.Tag, { foreignKey: 'tag_id' });
      }
    }
  });

  return taskTag;
}
