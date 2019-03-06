'use strict';

export default function (sequelize, dataTypes) {
  var interactionDesignationType = sequelize.define('InteractionDesignationType', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    desc: {
      type: dataTypes.STRING(50),
      allowNull: true
    },
    is_active: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'interaction_designation_type',
    timestamps: false
  });

  return interactionDesignationType;
}
