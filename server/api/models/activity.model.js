'use strict';

export default function (sequelize, dataTypes) {
  var activity = sequelize.define('Activity', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    client_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
    name: {
      type: dataTypes.STRING(500),
      allowNull: true
    },
    type_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
    start_date: {
      type: dataTypes.DATE,
      allowNull: true
    },
    due_date: {
      type: dataTypes.DATE,
      allowNull: true
    },
    quarter: {
      type: dataTypes.BIGINT(11),
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
    topic: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    topic_ge: {
      type: dataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: dataTypes.STRING,
      allowNull: true
    },
    debrief: {
      type: dataTypes.STRING,
      allowNull: true
    },
    color: {
      type: dataTypes.STRING,
      allowNull: true
    },
    asana_id: {
      type: dataTypes.STRING(36),
      allowNull: true
    },
    last_updated: {
      type: dataTypes.DATE,
      allowNull: true
    },
    last_updated_by: {
      type: dataTypes.STRING(150),
      allowNull: true
    },
    is_set_time: {
      type: dataTypes.BOOLEAN,
      allowNull: true
    },
    time: {
      type: dataTypes.STRING,
      allowNull: true
    },
  },
    {
      tableName: 'activity',
      timestamps: false,
      classMethods: {
        associate(models) {
          activity.belongsTo(models.TaskType, { foreignKey: 'type_id' });
          activity.belongsTo(models.Client, { foreignKey: 'client_id' });
          activity.hasMany(models.ActivityEvent, { foreignKey: 'activity_id' });
          activity.hasMany(models.ActivityCategory, { foreignKey: 'activity_id' });
          activity.hasMany(models.ActivitySpeaker, { foreignKey: 'activity_id' });
          activity.hasMany(models.ActivityReport, { foreignKey: 'activity_id' });
          activity.hasMany(models.ActivityAnalyst, { foreignKey: 'activity_id' });
          activity.hasMany(models.Note, { as: 'Notes', foreignKey: 'activity_id' });

          activity.belongsToMany(models.Analyst, {
            as: 'Analysts',
            through: 'ActivityAnalyst',
            foreignKey: 'activity_id'
          });

          activity.belongsToMany(models.Event, {
            as: 'Events',
            through: 'ActivityEvent',
            foreignKey: 'activity_id'
          });

          activity.belongsToMany(models.Research, {
            as: 'Categories',
            through: 'ActivityCategory',
            foreignKey: 'activity_id'
          });

          activity.belongsToMany(models.ClientSpeaker, {
            as: 'Speakers',
            through: 'ActivitySpeaker',
            foreignKey: 'activity_id'
          });

          activity.belongsToMany(models.RankingReport, {
            as: 'Reports',
            through: 'ActivityReport',
            foreignKey: 'activity_id'
          });

          activity.belongsToMany(models.Activity, {
            as: 'Outcomes',
            through: 'OutcomeActivity',
            foreignKey: 'activity_id',
            otherKey: 'outcome_id'
          });

          activity.belongsToMany(models.Activity, {
            as: 'Activities',
            through: 'OutcomeActivity',
            foreignKey: 'outcome_id',
            otherKey: 'activity_id'
          });
        }
      }
    });

  return activity;
}
