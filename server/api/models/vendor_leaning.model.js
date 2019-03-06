'use strict';

export default function (sequelize, dataTypes) {
  var vendorLeaning = sequelize.define('VendorLeaning', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
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
    tableName: 'vendor_leaning',
    timestamps: false
  });

  return vendorLeaning;
}
