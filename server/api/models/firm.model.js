'use strict';

export default function (sequelize, dataTypes) {
  var firm = sequelize.define('Firm', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    name: dataTypes.STRING,
  },
    {
      tableName: 'firm',
      timestamps: false,
      classMethods: {
        associate(models) {
          firm.belongsToMany(models.Research, {
            through: 'FirmResearch',
            foreignKey: 'firm_id'
          });
          firm.belongsToMany(models.Analyst, {
            as: 'Analyst',
            through: 'AnalystHistory',
            foreignKey: 'firm_id'
          });
          firm.belongsTo(models.Media, { as: 'Media', foreignKey: 'media_id' });
          firm.hasMany(models.FirmResearch, { foreignKey: 'firm_id' });
          firm.belongsToMany(models.Insight, {
            as: 'Insights',
            through: 'InsightFirm',
            foreignKey: 'firm_id'
          }),
            firm.hasMany(models.ClientHistory, { foreignKey: 'firm_id' });
            firm.belongsToMany(models.Event, {
              as: 'Events',
              through: 'EventFirm',
              foreignKey: 'firm_id'
            });
        }
      }
    });

  return firm;
}
