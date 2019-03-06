'use strict';

export default function (sequelize, dataTypes) {
  var role = sequelize.define('Role', {
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

    role_name: dataTypes.STRING,
    code: dataTypes.STRING,
  },
  {
    tableName: 'role',

    timestamps: false,

    classMethods: {
      associate (models) {
        role.belongsToMany(models.Claim, {through: 'RoleClaim', foreignKey: 'role_id'});
      }
    }
  });

  return role;
}
