'use strict';

export default function(sequelize, dataTypes) {
  var userActivityColor = sequelize.define('UserActivityColor', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },

      email: {
        type: dataTypes.STRING(500),
      },
      activity_id: {
        type: dataTypes.STRING,
      }, color: {
        type: dataTypes.STRING,
      },
      client_id: {
        type: dataTypes.STRING,
      }
    },
    {
      tableName: 'user_activity_color',
      timestamps: false,
      classMethods: {
        associate(models) {
        }
      }
    });

  return userActivityColor;
}
