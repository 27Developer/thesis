'use strict';

export default function (sequelize, dataTypes) {
  var reasonChangeMaturity = sequelize.define('ReasonChangeMaturity', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    reason_change_maturity: dataTypes.STRING,

    create_at: dataTypes.DATE,

    maturity_old: dataTypes.STRING,

    maturity_new: dataTypes.STRING,

  },
  {
    tableName: 'reason_change_maturity',
    timestamps: false,
    classMethods: {
      associate (models) {
        reasonChangeMaturity.belongsTo(models.Client, { foreignKey: 'client_id' });
        reasonChangeMaturity.belongsTo(models.Analyst, {foreignKey: 'analyst_id'});
      }
    }
  });

  return reasonChangeMaturity;
}
