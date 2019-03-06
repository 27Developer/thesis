'use strict';

export default function (sequelize, dataTypes) {
  var clientActivity = sequelize.define('ClientActivity', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING,
    },

    date: {
      type: dataTypes.DATE,
      defaultValue: new Date()
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    },
  },
  {
    tableName: 'client_activity',

    timestamps: false,
    classMethods: {
      associate (models) {
        clientActivity.belongsTo(models.Client, {as: 'Client', foreignKey: 'client_id'});
      }
    }
  });

  return clientActivity;
}
