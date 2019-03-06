'use strict';

export default function (sequelize, dataTypes) {
  var eventFirm = sequelize.define('EventFirm', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    }
  },
    {
      tableName: 'event_firm',

      timestamps: false,

      classMethods: {
        associate(models) {
            eventFirm.belongsTo(models.Firm, { as: 'Firms', foreignKey: 'firm_id' });
            eventFirm.belongsTo(models.Event, { as: 'Events', foreignKey: 'event_id' });
        }
      }
    });

  return eventFirm;
}
