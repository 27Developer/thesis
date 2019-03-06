'use strict';

export default function (sequelize, dataTypes) {
  var segment = sequelize.define('Segment', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    name: {
      type: dataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
  },
  {
    tableName: 'segment',

    timestamps: false,

    classMethods: {
      associate(models) {
        segment.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id' });
        segment.hasMany(models.SubSegment, { as: 'SubSegment', foreignKey: 'segment_id' });
      }
    }
  });

  return segment;
}
