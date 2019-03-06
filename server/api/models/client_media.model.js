'use strict';

export default function (sequelize, dataTypes) {
  var clientMedia = sequelize.define('ClientMedia', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    media_type: dataTypes.STRING,

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'client_media',
    timestamps: false,
    classMethods: {
      associate(models) {
        clientMedia.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id' });
        clientMedia.belongsTo(models.Media, { as: 'Media', foreignKey: 'media_id' });
      }
    }
  });

  return clientMedia;
}
