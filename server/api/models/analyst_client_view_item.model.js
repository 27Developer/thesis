'use strict';
export default function (sequelize, dataTypes) {
  var analystClientViewItem = sequelize.define('AnalystClientViewItem', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    item_id: dataTypes.STRING,
    client_id: dataTypes.STRING,
    analyst_id: dataTypes.STRING,
    detail: dataTypes.STRING,
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
    tableName: 'analyst_client_view_item',
    timestamps: false,
    classMethods: {}
  });
  return analystClientViewItem;
}
