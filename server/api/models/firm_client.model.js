'use strict';

export default function (sequelize, dataTypes) {
  var firmClient = sequelize.define('FirmClient', {
    firm_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    last_update: dataTypes.DATE
  },
    {
      tableName: 'firm_client',
      timestamps: false,
      classMethods: {
        associate(models) {
          firmClient.belongsTo(models.Firm, { foreignKey: 'firm_id' });
          firmClient.belongsTo(models.Client, { foreignKey: 'client_id' });
        }
      }
    });
  return firmClient;
}

