'use strict';

export default function(sequelize, dataTypes) {
  var analystFirmSubscriptionType = sequelize.define('AnalystFirmSubscriptionType', {
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
  }, {
    tableName: 'analyst_firm_subscription_type',

    timestamps: false,

    classMethods: {
      associate(models) {
        analystFirmSubscriptionType.belongsToMany(models.Client, {
          through: 'ClientAnalystFirmSubscription',
          foreignKey: 'afs_id'
        });
      }
    }
  });

  return analystFirmSubscriptionType;
}
