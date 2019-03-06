'use strict';

export default function (sequelize, dataTypes) {
  var churnReason = sequelize.define('ChurnReason', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'churn_reason',
    timestamps: false
  });

  return churnReason;
}
