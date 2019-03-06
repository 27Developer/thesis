'use strict';

export default function (sequelize, dataTypes) {
  var segmentationType = sequelize.define('SegmentationType', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'segmentation_type',
    timestamps: false
  });

  return segmentationType;
}
