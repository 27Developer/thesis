'use strict';
export default function(sequelize, dataTypes) {
  var event = sequelize.define('Event', {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },
      name: dataTypes.TEXT,

      location: dataTypes.STRING,

      start_date: {
        allowNull: true,
        type: dataTypes.DATE,
        defaultValue: null
      },

      end_date: {
        allowNull: true,
        type: dataTypes.DATE,
        defaultValue: null
      },

      last_update: dataTypes.DATE,

    },
    {
      tableName: 'event',
      timestamps: false,
      classMethods: {
        associate(models) {
          event.belongsToMany(models.Analyst, {
            as: 'Analysts',
            through: 'EventAnalyst',
            foreignKey: 'event_id'
          });
          event.belongsToMany(models.Client, {
            as: 'Clients',
            through: 'EventClient',
            foreignKey: 'event_id'
          });
          event.belongsToMany(models.Research, {
            as: 'Researchs',
            through: 'EventCategory',
            foreignKey: 'event_id'
          });
          event.belongsToMany(models.Firm, {
            as: 'Firms',
            through: 'EventFirm',
            foreignKey: 'event_id'
          });
          event.belongsToMany(models.Activity, {
            as: 'Activities',
            through: 'ActivityEvent',
            foreignKey: 'event_id'
          });
          event.hasMany(models.EventClient, { as: 'EventClients', foreignKey: 'event_id' })
          event.hasMany(models.EventAnalyst, { as: 'EventAnalysts', foreignKey: 'event_id' })
          event.hasMany(models.EventCategory, { as: 'EventCategorys', foreignKey: 'event_id' })
          event.hasMany(models.EventFirm, { as: 'EventFirms', foreignKey: 'event_id' })
        }
      }
    });
  return event;
}
