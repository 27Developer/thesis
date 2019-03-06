'use strict';
export default function (sequelize, dataTypes) {
  var researchItem = sequelize.define('ResearchItem', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    item_id: dataTypes.STRING,

    research_id: dataTypes.STRING,

    detail: dataTypes.STRING,

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
      last_updated: {
        type: dataTypes.DATE,
        allowNull: true
      },
      last_updated_by: {
        type: dataTypes.STRING(150),
        allowNull: true
      }

  },
  {
    tableName: 'research_item',
    timestamps: false,
    classMethods: {}
  });
  return researchItem;
}
