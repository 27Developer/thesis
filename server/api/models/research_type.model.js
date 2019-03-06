'use strict';

export default function (sequelize, dataTypes) {
  var researchType = sequelize.define('ResearchType', {
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

    desc: {
      type: dataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'research_type',
    timestamps: false
  });

  return researchType;
}
