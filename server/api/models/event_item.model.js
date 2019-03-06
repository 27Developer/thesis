'use strict';
export default function (sequelize, dataTypes) {
  var eventItem = sequelize.define('EventItem', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    item_id: dataTypes.STRING,

    event_id: dataTypes.STRING,

    detail: dataTypes.STRING,

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
      last_updated: {
        type: dataTypes.DATE,
        allowNull: true
      },
      last_updated_by: {
        type: dataTypes.STRING(150),
        allowNull: true
      }

  },
    {
      tableName: 'event_item',
      timestamps: false,
      classMethods: {}
    });
  return eventItem;
}
