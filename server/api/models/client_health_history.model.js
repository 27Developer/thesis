'use strict';

export default function (sequelize, dataTypes) {
  var clientHealthHistory = sequelize.define('ClientHealthHistory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    date: dataTypes.DATE,

    sentiment: dataTypes.INTEGER,

    mechanics: dataTypes.INTEGER,

    message: dataTypes.INTEGER,

    outcome: dataTypes.INTEGER,

    activation: dataTypes.INTEGER,

    likelyhood_renew_0_3: dataTypes.INTEGER,

    likelyhood_renew_4_6: dataTypes.INTEGER,

    program_health: dataTypes.INTEGER,

    comments: dataTypes.STRING(500),

    load: dataTypes.INTEGER,

    user_comment: dataTypes.STRING(50),

    created_date: dataTypes.DATE
  },
  {
    tableName: 'client_health_history',

    timestamps: false,

    classMethods: {
      associate (models) {
        clientHealthHistory.belongsTo(models.Client, { foreignKey: 'client_id' });
      }
    }
  });

  return clientHealthHistory;
}
