'use strict';

export default function (sequelize, dataTypes) {
  var requestBriefing = sequelize.define('RequestBriefing', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    task_id: {
      type: dataTypes.STRING,
      allowNull: false
    },
    submit_time: {
      type: dataTypes.DATE,
      allowNull: false,
    }
  },
  {
    tableName: 'request_briefing',
    timestamps: false
  });

  return requestBriefing;
}
