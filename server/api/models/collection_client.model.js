'use strict';

export default function (sequelize, dataTypes) {
  var collectionClient = sequelize.define('CollectionClient', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'collection_client',
    timestamps: false,
    classMethods: {
      associate(models) {
        collectionClient.belongsTo(models.Collection, { as: 'Collections', foreignKey: 'collection_id' });
        collectionClient.belongsTo(models.Client, { as: 'Clients', foreignKey: 'client_id' });
      }
    }
  });

  return collectionClient;
}
