/**
 * Sequelize initialization module
 */

'use strict';

import config from '../config/environment';
import sequelize from 'sequelize';

var db = {
  Sequelize: sequelize,
  sequelize: new sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, {
    host: config.sequelize.host,
    port: config.sequelize.port
  })
};

// Insert models below
db.AnalystFirmSubscriptionType = db.sequelize.import('../api/models/analyst_firm_subscription_type.model');
db.Client = db.sequelize.import('../api/models/client.model');
db.ClientAnalystFirmSubscription = db.sequelize.import('../api/models/client_analyst_firm_subscription.model');
db.ClientExecutive = db.sequelize.import('../api/models/client_executive.model');
db.ClientHistory = db.sequelize.import('../api/models/client_history.model');
db.ClientPartner = db.sequelize.import('../api/models/client_partner.model');
db.ClientType = db.sequelize.import('../api/models/client_type.model');
db.Cohort = db.sequelize.import('../api/models/cohort.model');
db.ChurnReason = db.sequelize.import('../api/models/churn_reason.model');
db.Effort = db.sequelize.import('../api/models/effort.model');
db.SegmentationType = db.sequelize.import('../api/models/segmentation_type.model');
db.Task = db.sequelize.import('../api/models/task.model');
db.TaskType = db.sequelize.import('../api/models/task_type.model');
db.InteractionDesignationType = db.sequelize.import('../api/models/interaction_designation_type.model');
db.InteractionType = db.sequelize.import('../api/models/interaction_type.model');
db.AnalystMedia = db.sequelize.import('../api/models/analyst_media.model');
db.Analyst = db.sequelize.import('../api/models/analyst.model');
db.AnalystHistory = db.sequelize.import('../api/models/analyst_history.model');
db.Research = db.sequelize.import('../api/models/research.model');
db.ResearchType = db.sequelize.import('../api/models/research_type.model');
db.AnalystResearchCategories = db.sequelize.import('../api/models/analyst_research_categories.model');
db.Firm = db.sequelize.import('../api/models/firm.model');
db.VendorLeaning = db.sequelize.import('../api/models/vendor_leaning.model');
db.ClientHealthHistory = db.sequelize.import('../api/models/client_health_history.model');
db.ClientHealthHistoryRecent = db.sequelize.import('../api/models/client_health_history_recent.model');
db.ClientSpeaker = db.sequelize.import('../api/models/client_speaker.model');
db.ClientAnalystAlignmentHistory = db.sequelize.import('../api/models/client_analyst_alignment_history.model');
db.ImportanceByAnalystCd = db.sequelize.import('../api/models/importance_by_analyst_cd.model');
db.MaturityByAnalyst = db.sequelize.import('../api/models/maturity_by_analyst.model');
db.Tag = db.sequelize.import('../api/models/tag.model');
db.TaskTag = db.sequelize.import('../api/models/task_tag.model');
db.TaskInteraction = db.sequelize.import('../api/models/task_interaction.model');
db.ClientRankingReport = db.sequelize.import('../api/models/client_ranking_report.model');
db.RankingReport = db.sequelize.import('../api/models/ranking_report.model');
db.RankingReportResearch = db.sequelize.import('../api/models/ranking_report_research.model');
db.RankingReportAnalyst = db.sequelize.import('../api/models/ranking_report_analyst.model');
db.Objective = db.sequelize.import('../api/models/objective.model');
db.ClientObjective = db.sequelize.import('../api/models/client_objective.model');
db.ClientResouce = db.sequelize.import('../api/models/client_resource.model');
db.Media = db.sequelize.import('../api/models/media.model');
db.ClientMedia = db.sequelize.import('../api/models/client_media.model');
db.AnalystMedia = db.sequelize.import('../api/models/analyst_media.model');
db.ClientSpeakerMedia = db.sequelize.import('../api/models/client_speaker_media.model');
db.ClientAnalystObjective = db.sequelize.import('../api/models/client_analyst_objective.model');
db.ClientResearchCategories = db.sequelize.import('../api/models/client_research_categories.model');
db.ClientActivity = db.sequelize.import('../api/models/client_activity.model');
db.Placement = db.sequelize.import('../api/models/placement.model');
db.User = db.sequelize.import('../api/models/user.model');
db.UserToken = db.sequelize.import('../api/models/user_token.model');
db.Role = db.sequelize.import('../api/models/role.model');
db.Claim = db.sequelize.import('../api/models/claim.model');
db.RoleClaim = db.sequelize.import('../api/models/role_claim.model');
db.RequestBriefing = db.sequelize.import('../api/models/request_briefing.model');
db.Country = db.sequelize.import('../api/models/country.model');
db.State = db.sequelize.import('../api/models/state.model');
db.Region = db.sequelize.import('../api/models/region.model');
db.ReasonChangeMaturity = db.sequelize.import('../api/models/reason_change_maturity.model');
db.TableConfig = db.sequelize.import('../api/models/table_config.model');
db.ObjectTemplates = db.sequelize.import('../api/models/object_templates.model');
db.Groups = db.sequelize.import('../api/models/groups.model');
db.Items = db.sequelize.import('../api/models/items.model');
db.ChangeLog = db.sequelize.import('../api/models/change_log.model');
db.AnalystItem = db.sequelize.import('../api/models/analyst_item.model');
db.FirmResearch = db.sequelize.import('../api/models/firm_research.model');
db.ClientItem = db.sequelize.import('../api/models/client_item.model');
db.FirmItem = db.sequelize.import('../api/models/firm_item.model');
db.ReportItem = db.sequelize.import('../api/models/report_item.model');
db.Segment = db.sequelize.import('../api/models/segment.model');
db.SubSegment = db.sequelize.import('../api/models/sub_segment.model');
db.SubSegmentAnalyst = db.sequelize.import('../api/models/sub_segment_analyst.model');
db.ResearchItem = db.sequelize.import('../api/models/research_item.model');
db.GlobalSetting = db.sequelize.import('../api/models/global_setting.model');
db.Event = db.sequelize.import('../api/models/event.model');
db.EventItem = db.sequelize.import('../api/models/event_item.model.js');
db.EventAnalyst = db.sequelize.import('../api/models/event_analyst.model.js');
db.EventClient = db.sequelize.import('../api/models/event_client.model.js');
db.EventCategory = db.sequelize.import('../api/models/event_categoy.model.js');
db.EventFirm = db.sequelize.import('../api/models/event_firm.model.js');
db.AnalystClientViewItem = db.sequelize.import('../api/models/analyst_client_view_item.model');
db.Activity = db.sequelize.import('../api/models/activity.model');
db.ActivityEvent = db.sequelize.import('../api/models/activity_event.model');
db.ActivityCategory = db.sequelize.import('../api/models/activity_category.model');
db.ActivityReport = db.sequelize.import('../api/models/activity_report.model');
db.ActivitySpeaker = db.sequelize.import('../api/models/activity_speaker.model');
db.ActivityAnalyst = db.sequelize.import('../api/models/activity_analyst.model');
db.ActivityItem = db.sequelize.import('../api/models/activity_item.model');
db.Note = db.sequelize.import('../api/models/note.model');
db.Insight = db.sequelize.import('../api/models/insight.model');
db.InsightClient = db.sequelize.import('../api/models/insight_client.model');
db.InsightClientStatus = db.sequelize.import('../api/models/insight_client_status.model');
db.InsightAnalyst = db.sequelize.import('../api/models/insight_analyst.model.js');
db.InsightEvent = db.sequelize.import('../api/models/insight_event.model.js');
db.InsightActivity = db.sequelize.import('../api/models/insight_activity.model.js');
db.InsightCategory = db.sequelize.import('../api/models/insight_category.model.js');
db.InsightReport = db.sequelize.import('../api/models/insight_report.model.js');
db.Collection = db.sequelize.import('../api/models/collection.model.js');
db.CollectionClient = db.sequelize.import('../api/models/collection_client.model.js')
db.ActivityLog = db.sequelize.import('../api/models/activity_log.model.js');
db.Market = db.sequelize.import('../api/models/market.model.js');
db.MarketCategory = db.sequelize.import('../api/models/market_category.model.js');
db.MarketItem = db.sequelize.import('../api/models/market_item.model.js');
db.PublishLink = db.sequelize.import('../api/models/publish_link.model.js');
db.InsightFirm = db.sequelize.import('../api/models/insight_firm.model.js');
db.ClientSubcriber = db.sequelize.import('../api/models/client_subcriber.model.js');
db.ClientAssigned = db.sequelize.import('../api/models/client_assigned.model.js');
db.CollectionItem = db.sequelize.import('../api/models/collection_item.model.js');
db.OutcomeActivity = db.sequelize.import('../api/models/outcome_activity.model.js');
db.FirmClient = db.sequelize.import('../../server/api/models/firm_client.model.js');
db.FirmPlacement = db.sequelize.import('../../server/api/models/firm_placement.model.js');
db.UserActivityColor = db.sequelize.import('../../server/api/models/user_activity_color.model.js');

//Create association between each models
Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
