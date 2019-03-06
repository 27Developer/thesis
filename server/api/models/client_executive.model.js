'use strict';

export default function (sequelize, dataTypes) {
  var clientExecutive = sequelize.define('ClientExecutive', {
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
    tableName: 'client_executive',
    timestamps: false
  });

  return clientExecutive;
}
