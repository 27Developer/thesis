'use strict';

export default function (sequelize, dataTypes) {
  var clientHistory = sequelize.define('ClientHistory', {
    id: {
      type: dataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV4
    },

    insert_date: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },

    analyst_plan: dataTypes.STRING,

    tenure: dataTypes.DECIMAL,

    monthly_recurring_revenue: dataTypes.DECIMAL,

    executive_sponser: dataTypes.STRING,

    buyer_nps: dataTypes.STRING,

    churn_date: dataTypes.DATE,

    poc_nps: dataTypes.STRING,

    overall_nps: dataTypes.STRING,

    team_email: dataTypes.STRING,

    address: dataTypes.STRING,

    city: dataTypes.STRING,

    country: dataTypes.STRING,

    state: dataTypes.STRING,

    influence: dataTypes.STRING,

    phone: dataTypes.STRING,

    zip_code: dataTypes.STRING,

    website_url: dataTypes.STRING,

    profile_description: dataTypes.STRING,

    client_speakers: dataTypes.STRING,

    client_assigned: dataTypes.STRING,

    is_active_record: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

  },
  {
    tableName: 'client_history',

    timestamps: false,

    classMethods: {
      associate (models) {
        clientHistory.belongsTo(models.Client, { foreignKey: 'client_id' });
        clientHistory.belongsTo(models.Cohort, { foreignKey: 'cohort_id' });
        clientHistory.belongsTo(models.Collection, { foreignKey: 'collection_id' });
        clientHistory.belongsTo(models.Effort, { foreignKey: 'effort_score_cd' });
        clientHistory.belongsTo(models.SegmentationType, { foreignKey: 'segmentation_type_id' });
        clientHistory.belongsTo(models.ChurnReason, { foreignKey: 'churn_reason_id' });
        clientHistory.belongsTo(models.ClientType, { foreignKey: 'client_type_id' });
      }
    }
  });

  return clientHistory;
}
