'use strict';

export default function (sequelize, dataTypes) {
  var media = sequelize.define('Media', {
    media_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false
    },

    media_name: dataTypes.STRING,
    created_date: {
      type: dataTypes.DATE,
      defaultValue: new Date()
    },
    media_data: dataTypes.BLOB(),

    small_media_data: dataTypes.BLOB()
  },
  {
    tableName: 'media',
    timestamps: false,
    classMethods: {
      associate (models) {
        media.hasMany(models.ClientMedia, { as: 'ClientMedia', foreignKey: 'media_id' });
        media.hasMany(models.AnalystMedia, { as: 'AnalystMedia', foreignKey: 'media_id' });
        media.hasOne(models.Firm, { as: 'Firm', foreignKey: 'media_id' });
        media.belongsToMany(models.Client, {
          as: 'Client',
          through: 'ClientMedia',
          foreignKey: 'media_id'
        });
        media.belongsToMany(models.Analyst, {
          as: 'Analyst',
          through: 'AnalystMedia',
          foreignKey: 'media_id'
        });
      }
    }
  });

  return media;
}
