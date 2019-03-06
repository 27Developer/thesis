'use strict';

export default function (sequelize, dataTypes) {
  var claim = sequelize.define('Claim', {
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

    claim_name: dataTypes.STRING,
    code: dataTypes.STRING,
  },
  {
    tableName: 'claim',

    timestamps: false,

    classMethods: {
      associate (models) {
        claim.belongsToMany(models.Role, {through: 'RoleClaim', foreignKey: 'claim_id'});
      }
    }
  });

  return claim;
}
