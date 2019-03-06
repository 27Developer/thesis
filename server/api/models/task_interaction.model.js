'use strict';

export default function(sequelize, dataTypes) {
  var taskInteraction = sequelize.define('TaskInteraction', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    task_id: {
      type: dataTypes.STRING(36),
      allowNull: false
    },
    interaction_id: {
      type: dataTypes.STRING(36),
      allowNull: false
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'task_interaction',
    timestamps: false,
    classMethods: {
      associate (models) {
        taskInteraction.belongsTo(models.Task, { foreignKey: 'task_id' });
        taskInteraction.belongsTo(models.InteractionType, { foreignKey: 'interaction_id' });
      }
    }
  });

  return taskInteraction;
}
