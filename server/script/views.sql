-- all_activity_task view 03/10/2018
USE `spotlight`;
CREATE
     OR REPLACE ALGORITHM = UNDEFINED
    DEFINER = `root`@`localhost`
    SQL SECURITY DEFINER
VIEW `all_activity_task` AS
    (SELECT
        `a`.`id` AS `id`,
        `a`.`name` AS `name`,
        `c`.`name` AS `client_name`,
        `c`.`id` AS `client_id`,
        `tt`.`desc` AS `type`,
        `tt`.`kind` AS `type_kind`,
        `a`.`start_date` AS `start_date`,
        `a`.`due_date` AS `due_date`,
        `a`.`topic` AS `topic`,
        `a`.`debrief` AS `debrief`,
        `a`.`description` AS `desc`,
        `a`.`sentiment` AS `sentiment`,
        GROUP_CONCAT(DISTINCT `an`.`name`
            SEPARATOR ', ') AS `all_analyst`,
        GROUP_CONCAT(DISTINCT `an`.`id`
            SEPARATOR ', ') AS `all_analyst_id`,
        GROUP_CONCAT(DISTINCT `csp`.`name`
            SEPARATOR ', ') AS `all_speaker`,
        `a`.`is_set_time` AS `is_set_time`,
        (CASE
      WHEN `a`.`is_set_time` = true THEN CAST(`a`.`due_date` AS TIME)
      ELSE NULL
      END) AS `time`,
        'activity' AS `source`
    FROM
        ((((((`activity` `a`
        LEFT JOIN `client` `c` ON ((`c`.`id` = `a`.`client_id`)))
        LEFT JOIN `task_type` `tt` ON ((`tt`.`id` = `a`.`type_id`)))
        LEFT JOIN `activity_analyst` `aa` ON ((`a`.`id` = `aa`.`activity_id`)))
        LEFT JOIN `analyst` `an` ON ((`an`.`id` = `aa`.`analyst_id`)))
        LEFT JOIN `activity_speaker` `asp` ON ((`a`.`id` = `asp`.`activity_id`)))
        LEFT JOIN `client_speaker` `csp` ON ((CONVERT( `csp`.`id` USING UTF8) = `asp`.`speaker_id`)))
    GROUP BY `a`.`id`) UNION (SELECT
        `t`.`id` AS `id`,
        `t`.`task_name` AS `name`,
        `c`.`name` AS `client_name`,
        `c`.`id` AS `client_id`,
        `tt`.`desc` AS `type`,
        `tt`.`kind` AS `type_kind`,
        NULL AS `start_date`,
        `t`.`date` AS `due_date`,
        `t`.`topic` AS `topic`,
        `t`.`debrief` AS `debrief`,
        `t`.`description` AS `desc`,
        `t`.`sentiment` AS `sentiment`,
        `an`.`name` AS `all_analyst`,
        `an`.`id` AS `all_analyst_id`,
        `t`.`speakers` AS `all_speaker`,
        0 AS `is_set_time`,
        CAST(NULL AS TIME) AS `time`,
        'task' AS `source`
    FROM
        (((((`task` `t`
        LEFT JOIN `client` `c` ON ((`t`.`client_id` = `c`.`id`)))
        LEFT JOIN `task_interaction` `ti` ON ((`t`.`id` = `ti`.`task_id`)))
        LEFT JOIN `interaction_type` `it` ON ((`ti`.`interaction_id` = `it`.`id`)))
        LEFT JOIN `task_type` `tt` ON ((`tt`.`id` = `it`.`task_type_id`)))
        LEFT JOIN `analyst` `an` ON ((`an`.`id` = `t`.`analyst_id`)))) ORDER BY `due_date` DESC;



10/28/2018
=============
CREATE
    ALGORITHM = UNDEFINED
    DEFINER = `Dev27`@`%`
    SQL SECURITY DEFINER
VIEW `all_activity_task_number_insight` AS
    SELECT
        `a`.`activity_id` AS `id`,
        COUNT(`a`.`activity_id`) AS `count`
    FROM
        (`insight_activity` `a`
        JOIN `insight` `b` ON (((`a`.`insight_id` = `b`.`id`)
            AND (`b`.`is_active` = 1))))
    GROUP BY `a`.`activity_id`


CREATE
    ALGORITHM = UNDEFINED
    DEFINER = `Dev27`@`%`
    SQL SECURITY DEFINER
VIEW `all_activity_task_number_past_insight` AS
    (SELECT
        `a`.`activity_id` AS `id`,
        COUNT(`a`.`activity_id`) AS `count`
    FROM
        (`insight_activity` `a`
        JOIN `insight` `b` ON (((`a`.`insight_id` = `b`.`id`)
            AND (`b`.`is_active` = 1)
            AND (`b`.`updated_date` >= (NOW() - INTERVAL 90 DAY)))))
    GROUP BY `a`.`activity_id`)


CREATE
    ALGORITHM = UNDEFINED
    DEFINER = `Dev27`@`%`
    SQL SECURITY DEFINER
VIEW `all_activity_task_count_insight` AS
    SELECT
        `activity_task`.`id` AS `id`,
        `activity_task`.`name` AS `name`,
        `activity_task`.`client_name` AS `client_name`,
        `activity_task`.`client_id` AS `client_id`,
        `activity_task`.`type` AS `type`,
        `activity_task`.`type_kind` AS `type_kind`,
        `activity_task`.`start_date` AS `start_date`,
        `activity_task`.`due_date` AS `due_date`,
        `activity_task`.`topic` AS `topic`,
        `activity_task`.`debrief` AS `debrief`,
        `activity_task`.`desc` AS `desc`,
        `activity_task`.`sentiment` AS `sentiment`,
        `activity_task`.`all_analyst` AS `all_analyst`,
        `activity_task`.`all_analyst_id` AS `all_analyst_id`,
        `activity_task`.`all_speaker` AS `all_speaker`,
        `activity_task`.`is_set_time` AS `is_set_time`,
        `activity_task`.`time` AS `time`,
        `activity_task`.`source` AS `source`,
        `number_insight`.`count` AS `number_insight`,
        `number_past_insight`.`count` AS `number_past_insight`
    FROM
        ((`all_activity_task` `activity_task`
        LEFT JOIN `all_activity_task_number_insight` `number_insight` ON ((`activity_task`.`id` = `number_insight`.`id`)))
        LEFT JOIN `all_activity_task_number_past_insight` `number_past_insight` ON ((`number_past_insight`.`id` = `activity_task`.`id`)))
