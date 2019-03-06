'use strict';

export default function(sequelize, dataTypes) {
  var tag = sequelize.define('Tag', {
    id: {
      type: dataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    description: {
      type: dataTypes.STRING(100),
      allowNull: false
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    asana_id: {
      type: dataTypes.STRING(45),
    },
  },
  {
    tableName: 'tag',
    timestamps: false,
    classMethods: {
      associate (models) {
        tag.belongsToMany(models.Task, { as: 'Tasks', through: { model: models.TaskTag, unique: false }, foreignKey: 'tag_id' });
      }
    }
  });

  return tag;
}
