

ALTER TABLE `activity`
ADD INDEX `idx_client_id` (`client_id` ASC);

ALTER TABLE `activity_event`
ADD INDEX `fk_event_id_idx` (`event_id` ASC);
ALTER TABLE `activity_event`
ADD CONSTRAINT `fk_event_id`
  FOREIGN KEY (`event_id`)
  REFERENCES `event` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `activity_event`
ADD INDEX `fk_activity_id_idx` (`activity_id` ASC);
ALTER TABLE `activity_event`
ADD CONSTRAINT `fk_activity_id`
  FOREIGN KEY (`activity_id`)
  REFERENCES `activity` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE `activity_item`
ADD INDEX `idx_item_id` (`item_id` ASC), -- Should be FK
ADD INDEX `idx_activity_id` (`activity_id` ASC); -- SHould be FK

ALTER TABLE `activity_log`
ADD INDEX `idx_object_page` (`object_id` ASC,`page` ASC);

ALTER TABLE `analyst_client_view_item`
ADD INDEX `idx_analyst_client` (`analyst_id` ASC, `client_id` ASC),
ADD INDEX `idx_item_analyst_client` (item_id ASC,`analyst_id` ASC, `client_id` ASC);

ALTER TABLE `analyst_item`
ADD INDEX `idx_analyst_id_idx` (`analyst_id` ASC), -- Should be FK
ADD INDEX `idx_item_analyst` (`item_id` ASC, `analyst_id` ASC);

ALTER TABLE `change_log`
ADD INDEX `idx_object_id` (`object_id` ASC, `group_id` ASC),
ADD INDEX `idx_object_page` (`object_id` ASC, `page` ASC);

ALTER TABLE `client_assigned`
ADD INDEX `fk_user_id_idx` (`client_id` ASC);
ALTER TABLE `client_assigned`
ADD CONSTRAINT `fk_user_id`
  FOREIGN KEY (`user_id`)
  REFERENCES `user` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `client_assigned`
ADD INDEX `fk_client_id_idx` (`client_id` ASC);
ALTER TABLE `client_assigned`
ADD CONSTRAINT `fk_client_id`
  FOREIGN KEY (`client_id`)
  REFERENCES `client` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `client_history`
ADD INDEX `idx_firm_id` (`firm_id` ASC), -- Should be FK
ADD INDEX `idx_is_active_record` (`is_active_record` ASC),
ADD INDEX `idx_client_is_active_record` (`client_id` ASC, `is_active_record` ASC);

ALTER TABLE `client_item`
ADD INDEX `idx_client_id` (`client_id` ASC), -- Should be fk
ADD INDEX `idx_client_item` (`client_id` ASC,`item_id` ASC);

ALTER TABLE `client_subcriber`
ADD INDEX `idx_user_id` (`user_id` ASC), -- Should be fk
ADD INDEX `idx_client_id` (`client_id` ASC);  -- Should be fk

ALTER TABLE `collection_client`
ADD INDEX `idx_collection_id` (`collection_id` ASC), -- should be fk
ADD INDEX `idx_client_id` (`client_id` ASC); -- should be fk

ALTER TABLE `collection_item`
ADD INDEX `idx_item_collection` (`item_id` ASC, `collection_id` ASC),
ADD INDEX `idx_collection_id` (`collection_id` ASC); -- Should be FK

ALTER TABLE `event_analyst`
ADD INDEX `idx_analyst_id` (`analyst_id` ASC), -- Should be FK
ADD INDEX `idx_event_id` (`event_id` ASC); -- Should be FK

ALTER TABLE `event_category`
ADD INDEX `idx_event_id` (`event_id` ASC), -- Should be FK
ADD INDEX `idx_category_id` (`research_id` ASC); -- Should be FK

ALTER TABLE `event_client`
ADD INDEX `idx_event_id` (`event_id` ASC), -- Should be FK
ADD INDEX `idx_client_id` (`client_id` ASC); -- Should be FK

ALTER TABLE `event_firm`
ADD INDEX `idx_event_id` (`event_id` ASC), -- Should be FK
ADD INDEX `idx_firm_id` (`firm_id` ASC); -- Should be FK

ALTER TABLE `event_item`
ADD INDEX `idx_event_id` (`event_id` ASC), -- Should be FK
ADD INDEX `idx_item_event` (`item_id` ASC,`event_id` ASC);

ALTER TABLE `firm_item`
ADD INDEX `idx_firm_id` (`firm_id` ASC), -- Should be FK
ADD INDEX `idx_item_firm` (`item_id` ASC, `firm_id` ASC);

ALTER TABLE `groups`
ADD INDEX `idx_template_id` (`template_id` ASC), -- Should be FK
ADD INDEX `idx_template_active_firm` (`template_id` ASC, `is_active` ASC, `firm_id` ASC),
ADD INDEX `idx_template_active_event` (`template_id` ASC, `is_active` ASC, `event_id` ASC),
ADD INDEX `idx_cluster` (`template_id` ASC, `is_active` ASC, `client_id` ASC, `firm_id` ASC, `event_id` ASC);

ALTER TABLE `insight_activity`
ADD INDEX `idx_activity_id` (`activity_id` ASC), -- FK after 1.3 gone
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `insight_analyst`
ADD INDEX `idx_analyst_id` (`analyst_id` ASC), -- Should be FK
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK


ALTER TABLE `insight_category`
ADD INDEX `idx_category_id` (`category_id` ASC), -- FK after 1.3 gone
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `insight_client`
ADD INDEX `idx_client_id` (`client_id` ASC), -- Should be FK
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `insight_event`
ADD INDEX `idx_event_id` (`event_id` ASC), -- FK after 1.3 gone
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `insight_firm`
ADD INDEX `idx_firm_id` (`firm_id` ASC), -- Should be FK
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `insight_report`
ADD INDEX `idx_report_id` (`report_id` ASC), -- Should be FK
ADD INDEX `idx_insight_id` (`insight_id` ASC); -- Should be FK

ALTER TABLE `market_category`
ADD INDEX `idx_category_id` (`category_id` ASC), -- Should be FK
ADD INDEX `idx_market_id` (`market_id` ASC); -- Should be FK

ALTER TABLE `market_item`
ADD INDEX `idx_item_market` (`item_id` ASC,`market_id` ASC),
ADD INDEX `idx_market_id` (`market_id` ASC); -- Should be FK

-- analystId is string of list analysts
ALTER TABLE `note`
ADD INDEX `idx_activity_id` (`activity_id` ASC); -- FK after 12

ALTER TABLE `outcome_activity`
ADD INDEX `idx_outcome_id` (`outcome_id` ASC), -- Should be FK
ADD INDEX `idx_activity_id` (`activity_id` ASC); -- Should be FK after 12

ALTER TABLE `publish_link`
ADD INDEX `idx_object_id` (`object_id` ASC);

ALTER TABLE `ranking_report_analyst`
ADD INDEX `idx_analyst_id` (`analyst_id` ASC), -- Should be FK
ADD INDEX `idx_report_id` (`ranking_report_id` ASC); -- Should be FK

ALTER TABLE `ranking_report_research`
ADD INDEX `idx_research_id` (`research_id` ASC), -- Should be FK
ADD INDEX `idx_report_id` (`ranking_report_id` ASC); -- Should be FK

ALTER TABLE `report_item`
ADD INDEX `idx_item_report` (`item_id` ASC,`report_id` ASC),
ADD INDEX `idx_report_id` (`report_id` ASC); -- Should be FK

ALTER TABLE `research_item`
ADD INDEX `idx_item_research` (`item_id` ASC,`research_id` ASC),
ADD INDEX `idx_research_id` (`research_id` ASC); -- Should be FK

ALTER TABLE `segment`
ADD INDEX `idx_client_id` (`client_id` ASC); -- Should be FK

ALTER TABLE `sub_segment`
ADD INDEX `idx_segment_id` (`segment_id` ASC); -- Should be FK

ALTER TABLE `sub_segment_analyst`
ADD INDEX `idx_client_id` (`client_id` ASC), -- Should be FK
ADD INDEX `idx_analyst_id` (`analyst_id` ASC), -- Should be FK
ADD INDEX `idx_sub_segment_id` (`sub_segment_id` ASC), -- Should be FK
ADD INDEX `idx_client_analyst` (`analyst_id` ASC, `client_id` ASC),
ADD INDEX `idx_subsegment_client_analyst` (`sub_segment_id` ASC, `analyst_id` ASC, `client_id` ASC);

ALTER TABLE `user`
ADD INDEX `idx_is_active` (`is_active` ASC);

ALTER TABLE `research`
ADD INDEX `idx_is_active` (`is_active` ASC);

ALTER TABLE `firm`
ADD INDEX `idx_is_active` (`is_active` ASC);

--  add index name
ALTER TABLE `activity`
ADD INDEX `index_activity_name` (`name` ASC);

ALTER TABLE `analyst`
ADD INDEX `index_analyst_name` (`name` ASC);

ALTER TABLE `client`
ADD INDEX `index_client_name` (`name` ASC);

ALTER TABLE `cohort`
ADD INDEX `index_cohort_name` (`name` ASC);

ALTER TABLE `collection`
ADD INDEX `index_name_collection` (`name` ASC);

ALTER TABLE `event`
ADD INDEX `index_name_event` (`name` ASC);

ALTER TABLE `firm`
ADD INDEX `index_name_firm` (`name` ASC);

ALTER TABLE `market`
ADD INDEX `index_market_name` (`name` ASC);

ALTER TABLE `research`
ADD INDEX `index_research_name` (`desc` ASC);
