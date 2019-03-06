'use strict';

export default function (sequelize, dataTypes) {
  var clientAnalystFirmSubscription = sequelize.define('ClientAnalystFirmSubscription', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    },

    insert_date: {
      type: dataTypes.DATE,
      defaultValue: new Date()
    }
  },
  {
    tableName: 'client_analyst_firm_subscription',

    timestamps: false
  });

  return clientAnalystFirmSubscription;
}
