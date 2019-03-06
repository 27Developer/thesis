'use strict';

export default function (sequelize, dataTypes) {
  var subSegment = sequelize.define('SubSegment', {
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
    detail: {
      type: dataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  },
  {
    tableName: 'sub_segment',

    timestamps: false,

    classMethods: {
      associate(models) {
        subSegment.belongsTo(models.Segment, { as: 'Segment', foreignKey: 'segment_id' });
        subSegment.belongsToMany(models.Analyst, {
          as: 'Analyst',
          through: 'SubSegmentAnalyst',
          foreignKey: 'sub_segment_id'
        });
        subSegment.hasMany(models.SubSegmentAnalyst, { as: 'SubSegmentAnalyst', foreignKey: 'sub_segment_id' });
      }
    }
  });

  return subSegment;
}
