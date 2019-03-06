'use strict';

export default function(sequelize, dataTypes) {
  var publishLink = sequelize.define('PublishLink', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },

      object_id: dataTypes.STRING,

      object_model: dataTypes.STRING,

      object_metadata: dataTypes.STRING,


      token: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4
      },

      exprire: dataTypes.DATE,

      create_date: dataTypes.DATE,
    },
    {
      tableName: 'publish_link',

      timestamps: false,
      classMethods: {
        associate (models) {
        }
      }
    });

  return publishLink;
}
