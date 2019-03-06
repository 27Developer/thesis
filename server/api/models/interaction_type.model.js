'use strict';

export default function (sequelize, dataTypes) {
  var interactionType = sequelize.define('InteractionType', {
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

    asana_tags: {
      type: dataTypes.STRING(100),
      allowNull: true
    },
  },
  {
    tableName: 'interaction_type',

    timestamps: false,

    classMethods: {
      associate (models) {
        interactionType.belongsTo(models.TaskType, { foreignKey: 'task_type_id' });
        interactionType.belongsTo(models.InteractionDesignationType, { foreignKey: 'interaction_designation_type_id' });
        interactionType.belongsToMany(models.Task, { as: 'Tasks', through: { model: models.TaskInteraction, unique: false }, foreignKey: 'interaction_id' });
      }
    }
  });

  return interactionType;
}
