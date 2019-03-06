'use strict';

export default function (sequelize, dataTypes) {
  var collection = sequelize.define('Collection', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false
    }
  },
    {
      tableName: 'collection',
      timestamps: true,
      underscored: true,
      classMethods: {
        associate(models) {
          collection.belongsToMany(models.Client, {
            as: 'Clients',
            through: 'CollectionClient',
            foreignKey: 'collection_id'
          });
          collection.hasMany(models.CollectionClient, { foreignKey: 'collection_id' });
        }
      }
    });

  return collection;
}
