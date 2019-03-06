'use strict';

export default function (sequelize, dataTypes) {
  var placement = sequelize.define('Placement', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    custom_name: {
      type: dataTypes.STRING,
    },

    create_at: {
      type: dataTypes.DATE,
      defaultValue: new Date()
    }
  },
  {
    tableName: 'ranking_report_placement',

    timestamps: false,
    classMethods: {
      associate (models) {
        placement.belongsTo(models.Client, {as: 'Client', foreignKey: 'client_id'});
      }
    }
  });

  return placement;
}
