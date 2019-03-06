'use strict';

export default function (sequelize, dataTypes) {
  var note = sequelize.define('Note', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    note_type: dataTypes.STRING,
    update_at: dataTypes.DATE,
    description: dataTypes.STRING,
    analyst_id: dataTypes.TEXT,
    activity_id: dataTypes.STRING,
    note_status: dataTypes.BOOLEAN,
    activity_type: dataTypes.STRING,
    start_date: dataTypes.DATE,
    end_date: dataTypes.DATE,
    note_time: dataTypes.STRING
  },
    {
      tableName: 'note',
      timestamps: false,
      classMethods: {
        associate(models) {
          note.belongsTo(models.TaskType, { as: 'TaskType', foreignKey: 'activity_type' });
          note.belongsTo(models.Activity, { foreignKey: 'activity_id' });
          note.belongsTo(models.Task, { foreignKey: 'activity_id' });
        }
      }
    });
  return note;
}
