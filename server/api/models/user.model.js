'use strict';

export default function (sequelize, dataTypes) {
  var user = sequelize.define('User', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false
    },
    first_login: {
      type: dataTypes.BOOLEAN,
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false
    },
    last_login: dataTypes.DATE,
    access_token: dataTypes.STRING,
    token_expire: dataTypes.DATE,
    token_id: dataTypes.STRING,
    full_name: dataTypes.STRING,
    client_ids: dataTypes.STRING,
    collection_ids: dataTypes.STRING
  },
  {
    tableName: 'user',
    timestamps: false,
    classMethods: {
      associate(models) {
        user.hasMany(models.UserToken, { as: 'UserToken', foreignKey: 'email' });
        user.belongsToMany(models.Client, {
          as: 'Clients',
          through: 'ClientAssigned',
          foreignKey: 'user_id'
        });
      }
    }
  });

  return user;
}
