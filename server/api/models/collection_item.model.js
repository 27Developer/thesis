'use strict';
export default function (sequelize, dataTypes) {
  var collectionItem = sequelize.define('CollectionItem', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    item_id: dataTypes.STRING,

    collection_id: dataTypes.STRING,

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
      tableName: 'collection_item',
      timestamps: false,
      classMethods: {}
    });
  return collectionItem;
}
