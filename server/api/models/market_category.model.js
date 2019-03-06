'use strict';

export default function (sequelize, dataTypes) {
  var marketCategory = sequelize.define('MarketCategory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
    {
      tableName: 'market_category',
      timestamps: false,
      classMethods: {
        associate(models) {
          marketCategory.belongsTo(models.Research, { foreignKey: 'category_id' })
          marketCategory.belongsTo(models.Market, { foreignKey: 'market_id' })
        }
      }
    });

  return marketCategory;
}
