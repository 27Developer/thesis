'use strict';

export default function(sequelize, dataTypes) {
  var firmPlacement = sequelize.define('FirmPlacement', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },

      placement_name: {
        type: dataTypes.STRING,
      },

      is_active: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'placement',

      timestamps: false,
      classMethods: {
        associate (models) {
          firmPlacement.belongsTo(models.Firm, { as: 'Firm', foreignKey: 'firm_id' });
        }
      }
    });

  return firmPlacement;
}
