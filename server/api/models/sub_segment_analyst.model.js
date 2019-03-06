'use strict';

export default function (sequelize, dataTypes) {
  var subSegmentAnalyst = sequelize.define('SubSegmentAnalyst', {
    sub_segment_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    analyst_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    client_id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },
  },
  {
    tableName: 'sub_segment_analyst',

    timestamps: false,

    classMethods: {
      associate(models) {
        subSegmentAnalyst.belongsTo(models.SubSegment, { as: 'SubSegment', foreignKey: 'sub_segment_id' });
        subSegmentAnalyst.belongsTo(models.Analyst, { as: 'Analyst', foreignKey: 'analyst_id' });
        subSegmentAnalyst.belongsTo(models.Client, { as: 'Client', foreignKey: 'client_id' });
      }
    }
  });

  return subSegmentAnalyst;
}
