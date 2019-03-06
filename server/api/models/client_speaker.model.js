'use strict';

export default function (sequelize, dataTypes) {
  var clientSpeaker = sequelize.define('ClientSpeaker', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: dataTypes.STRING,

    title: dataTypes.STRING,

    phone: dataTypes.STRING,

    email: dataTypes.STRING,

    comment: dataTypes.STRING

  },
  {
    tableName: 'client_speaker',
    timestamps: false,
    classMethods: {
      associate (models) {
        clientSpeaker.belongsTo(models.Client, {foreignKey: 'client_id'});
        clientSpeaker.hasMany(models.ClientSpeakerMedia, { foreignKey: 'client_speaker_id' });
        clientSpeaker.belongsToMany(models.Activity, {
          as: 'Activities',
          through: 'ActivitySpeaker',
          foreignKey: 'speaker_id'
        });
      }
    }
  });

  return clientSpeaker;
}
