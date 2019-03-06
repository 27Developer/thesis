'use strict';

export default function (sequelize, dataTypes) {
  var analystResearchCategories = sequelize.define('AnalystResearchCategories', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      defaultValue: true
    },

    insert_date: {
      type: dataTypes.DATE,
      defaultValue: new Date()
    }
  },
  {
    tableName: 'analyst_research_categories',
    timestamps: false,
    classMethods: {
      associate (models) {
        analystResearchCategories.belongsTo(models.Analyst,{foreignKey :'analyst_id'});
        analystResearchCategories.belongsTo(models.Research,{foreignKey :'research_id'});
      }
    }
  });

  return analystResearchCategories;
}
