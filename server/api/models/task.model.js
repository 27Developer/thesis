'use strict';

export default function (sequelize, dataTypes) {
  var task = sequelize.define('Task', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    asana_id: {
      type: dataTypes.STRING(45),
      allowNull: false
    },
    client_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
    analyst_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
      color: {
      type: dataTypes.STRING(45),
      allowNull: true
    },
    task_name: {
      type: dataTypes.STRING(250),
      allowNull: true
    },
    date: {
      type: dataTypes.DATE,
      allowNull: true
    },
    quarter: {
      type: dataTypes.BIGINT(11),
      allowNull: true
    },
    description: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    subtask_names: {
      type: dataTypes.STRING(200),
      allowNull: true
    },
    comments: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    topic_ge: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    core_status: {
      type: dataTypes.STRING(10),
      allowNull: true
    },
    firm_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
    speakers: {
      type: dataTypes.STRING(150),
      allowNull: true
    },
    sentiment: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
    primary_objective: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
    secondaryObjective: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
    topic: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    asana_name: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
    debrief: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    planning_designation: {
      type: dataTypes.STRING(2),
      allowNull: true
    },
    asana_project_id: {
      type: dataTypes.STRING(45),
      allowNull: true
    }

  },
  {
    tableName: 'task',
    timestamps: false,
    classMethods: {
      associate (models) {
        task.belongsTo(models.Analyst, { foreignKey: 'analyst_id' });
        task.belongsTo(models.Client, { foreignKey: 'client_id' });
        task.hasMany(models.Note, { as: 'Notes', foreignKey: 'activity_id' });
        task.belongsToMany(models.InteractionType, {
          through: {model: models.TaskInteraction, unique: false},
          foreignKey: 'task_id'
        });
        task.belongsToMany(models.Tag, {
          as: 'Tags',
          through: {model: models.TaskTag, unique: false},
          foreignKey: 'task_id'
        });
      }
    }
  });

  return task;
}
