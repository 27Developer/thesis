'use strict';

export default function (sequelize, dataTypes) {
  var clientPartner = sequelize.define('ClientPartner', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'client_partner',
    timestamps: false
  });

  return clientPartner;
}
