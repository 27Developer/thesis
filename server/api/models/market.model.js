'use strict';

export default function (sequelize, dataTypes) {
  var market = sequelize.define('Market', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false
    }
  },
    {
      tableName: 'market',
      timestamps: true,
      underscored: true,
      classMethods: {
        associate(models) {
          market.belongsToMany(models.Research, {
            as: 'Researchs',
            through: 'MarketCategory',
            foreignkey: 'market_id'
          });
        }
      }
    });

  return market;
}
