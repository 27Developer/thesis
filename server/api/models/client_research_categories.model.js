'use strict';

export default function (sequelize, dataTypes) {
  var clientResearchCategories = sequelize.define('ClientResearchCategories', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },

    research_id: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    },
    last_update : dataTypes.DATE

  },
    {
      tableName: 'client_research_category',
      timestamps: false,
      classMethods: {
        associate(models) {
          clientResearchCategories.belongsTo(models.Client, { foreignKey: 'client_id' });
          clientResearchCategories.belongsTo(models.Research, { foreignKey: 'research_id' });
        }
      }
    });
  return clientResearchCategories;
}
