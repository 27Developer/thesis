'use strict';

export default function (sequelize, dataTypes) {
  var roleClaim = sequelize.define('RoleClaim', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'role_claim',

    timestamps: false,
    classMethods: {
      associate (models) {
        roleClaim.belongsTo(models.Role, {foreignKey: 'role_id'});
        roleClaim.belongsTo(models.Claim, {foreignKey: 'claim_id'});
      }
    }
  });

  return roleClaim;
}
