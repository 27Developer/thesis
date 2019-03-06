'use strict';

export default function (sequelize, dataTypes) {
  var analystMedia = sequelize.define('AnalystMedia', {
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
    tableName: 'analyst_media',
    timestamps: false,
    classMethods: {
      associate (models) {
        analystMedia.belongsTo(models.Analyst, {as: 'Analyst', foreignKey: 'analyst_id'});
        analystMedia.belongsTo(models.Media, {as: 'Media', foreignKey: 'media_id'});
      }
    }
  });

  return analystMedia;
}
