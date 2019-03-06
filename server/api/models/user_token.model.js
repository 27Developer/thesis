'use strict';

export default function(sequelize, dataTypes) {
  var userToken = sequelize.define('UserToken', {
      email: dataTypes.STRING,

      access_token: dataTypes.STRING,

      token_expire: dataTypes.DATE,

      token_id: dataTypes.STRING,

    },
    {
      tableName: 'user_token',

      timestamps: false,

      classMethods: {
        associate (models) {
          userToken.belongsTo(models.User, { foreignKey: 'email' })
        }
      }
    });
  userToken.removeAttribute('id');
  return userToken;
}
