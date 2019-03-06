'use strict';

export default function (sequelize, dataTypes) {
  var eventCategory = sequelize.define('EventCategory', {
    event_id: {
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
      tableName: 'event_category',

      timestamps: false,
      classMethods: {
        associate(models) {
          eventCategory.belongsTo(models.Research, { as: 'Researchs', foreignKey: 'research_id' });
          eventCategory.belongsTo(models.Event, { as: 'Events', foreignKey: 'event_id' });
        }
      }
    });

  return eventCategory;
}
