'use strict';

export default function (sequelize, dataTypes) {
  var clientSpeakerMedia = sequelize.define('ClientSpeakerMedia', {
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
    tableName: 'client_speaker_media',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientSpeakerMedia.belongsTo(models.ClientSpeaker, {foreignKey: 'client_speaker_id'});
        clientSpeakerMedia.belongsTo(models.Media, {foreignKey: 'media_id'});
      }
    }
  });

  return clientSpeakerMedia;
}
