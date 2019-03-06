'use strict';
export default function (sequelize, dataTypes) {
  var object_templates = sequelize.define('ObjectTemplates', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    template_name: dataTypes.STRING,

    object: dataTypes.STRING,

    last_update: dataTypes.DATE,
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'object_templates',
    timestamps: false,
    classMethods: {
      associate (models) {
        object_templates.hasMany(models.Groups, { foreignKey: 'template_id' });
      }
    }
  });
  return object_templates;
}
