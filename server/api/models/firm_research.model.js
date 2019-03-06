'use strict';

export default function (sequelize, dataTypes) {
  var firmResearch = sequelize.define('FirmResearch', {
    firm_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    research_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'firm_research',

    timestamps: false,
    classMethods: {
      associate (models) {
        firmResearch.belongsTo(models.Firm, {foreignKey: 'firm_id'});
        firmResearch.belongsTo(models.Research, {foreignKey: 'research_id'});
      }
    }
  });

  return firmResearch;
}
