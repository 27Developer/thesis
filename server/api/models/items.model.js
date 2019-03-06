'use strict';
export default function (sequelize, dataTypes) {
  var items = sequelize.define('Items', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    index: dataTypes.INTEGER,

    item_name: dataTypes.STRING,

    item_type: dataTypes.STRING,

    item_value: dataTypes.STRING,

    last_update: dataTypes.DATE,
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'items',
    timestamps: false,
    classMethods: {
      associate (models) {
        items.belongsTo(models.Groups, { foreignKey: 'group_id' });
      }
    }
  });
  return items;
}
