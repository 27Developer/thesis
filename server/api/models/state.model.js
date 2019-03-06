'use strict';

export default function (sequelize, dataTypes) {
  var state = sequelize.define('State', {
    code: {
      type: dataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },

    state_name: {
      type: dataTypes.STRING,
      allowNull: false
    },
  },
  {
    tableName: 'state',

    timestamps: false,

    classMethods: {
      associate (models) {
        state.belongsTo(models.Country, {as: 'Country', foreignKey: 'country_code'});
      }
    }
  });

  return state;
}
