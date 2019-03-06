CREATE TABLE `media` (
  `media_id` VARCHAR(36) NOT NULL,
  `media_name` VARCHAR(150) NULL,
  `media_data` LONGBLOB NULL,
  `is_active` BIT(1) NULL,
  `created_date` DATETIME NULL,
  PRIMARY KEY (`media_id`),
  UNIQUE INDEX `media_id_UNIQUE` (`media_id` ASC)) ENGINE=InnoDB DEFAULT CHARSET=utf8;

====================================
CREATE TABLE `client_media` (
  `id` VARCHAR(36) NOT NULL,
  `client_id` VARCHAR(36) NULL,
  `media_id` VARCHAR(36) NULL,
  `media_type` VARCHAR(45) NULL,
 `created_date` DATETIME NULL,
  `is_active` BIT(1) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `client_fk_media_idx` (`client_id` ASC),
  INDEX `media_fkk_idx` (`media_id` ASC),
  CONSTRAINT `client_fk_media`
    FOREIGN KEY (`client_id`)
    REFERENCES `client` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `media_fkk`
    FOREIGN KEY (`media_id`)
    REFERENCES `media` (`media_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8;

====================================
ALTER TABLE `analyst_history`
ADD COLUMN `title` VARCHAR(150) NULL AFTER `is_active_record`,
ADD COLUMN `team` VARCHAR(150) NULL AFTER `title`;

====================================
ALTER TABLE `task`

ADD COLUMN `debrief` VARCHAR(500) NULL AFTER `asana_name`;


====================================
CREATE TABLE `analyst_media`
(
  `id` varchar(36) NOT NULL,

 `media_id` varchar(36) DEFAULT NULL,

  `media_type` varchar(45) DEFAULT NULL,

  `is_active` bit(1) DEFAULT NULL,

  `analyst_id` varchar(36) DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

 KEY `analyst_media_analyst_idx` (`analyst_id`),

 KEY `analyst_media_media_idx` (`media_id`),

  CONSTRAINT `analyst_media_analyst` FOREIGN KEY (`analyst_id`) REFERENCES `analyst` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT `analyst_media_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`media_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


=====================================
CREATE TABLE `client_analyst_objective`
 (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,

  `analyst_id` varchar(36) DEFAULT NULL,

  `detail` text DEFAULT NULL,

  `is_active_record` bit(1) DEFAULT NULL,

  `create_at` datetime DEFAULT NULL,

  `update_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

 KEY `client_analyst_objective-client_idx` (`client_id`),

  KEY `client_analyst_objective-analyst_idx` (`analyst_id`),

  CONSTRAINT `client_analyst_objective-analyst` FOREIGN KEY (`analyst_id`)
 REFERENCES `analyst` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT `client_analyst_objective-client` FOREIGN KEY (`client_id`)
 REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

========================================
ALTER TABLE `client_analyst_alignment_history`

ADD COLUMN `influence` TEXT NULL AFTER `insert_date`;


========================================
ALTER TABLE `maturity_by_analyst`

ADD COLUMN `client_id` VARCHAR(36) NULL AFTER `is_active`,

ADD COLUMN `clone_to` VARCHAR(36) NULL AFTER `client_id`;


========================================
ALTER TABLE `maturity_by_analyst`

ADD INDEX `client_maturity_idx` (`client_id` ASC);

ALTER TABLE `maturity_by_analyst`

ADD CONSTRAINT `client_maturity`
  FOREIGN KEY (`client_id`)

REFERENCES `client` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


=========================================
CREATE TABLE `objective` (
  `id` varchar(36) NOT NULL,

  `name` text,
  `client_id` varchar(36) DEFAULT NULL,

 `is_active` bit(1) NOT NULL,
  `update_at` datetime NOT NULL,

 `create_at` datetime NOT NULL,
  PRIMARY KEY (`id`),

  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `objective_client_idx` (`client_id`)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;


=========================================
CREATE TABLE `client_objective` (
  `id` varchar(36) NOT NULL,

  `objective_id` varchar(36) DEFAULT NULL,

 `client_id` varchar(36) DEFAULT NULL,

 `detail` text,
  `is_active` bit(1) NOT NULL,

 `update_at` datetime NOT NULL,

 `create_at` datetime NOT NULL,

 PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

 KEY `client_objective_idx` (`client_id`),

 KEY `client_objective_objective_idx` (`objective_id`),

 CONSTRAINT `client_objective` FOREIGN KEY (`client_id`)
REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,

CONSTRAINT `client_objective_objective` FOREIGN KEY (`objective_id`)
REFERENCES `objective` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;


=========================================
INSERT INTO `objective` (`id`, `name`, `is_active`, `update_at`, `create_at`) VALUES ('00000000-0000-0000-0000-000000000001', 'Move the Dot', true, '2017-10-13 06:31:39', '2017-10-13 06:31:39');
INSERT INTO `objective` (`id`, `name`, `is_active`, `update_at`, `create_at`) VALUES ('00000000-0000-0000-0000-000000000002', 'Shape Opinion', true, '2017-10-13 06:31:39', '2017-10-13 06:31:39');
INSERT INTO `objective` (`id`, `name`, `is_active`, `update_at`, `create_at`) VALUES ('00000000-0000-0000-0000-000000000003', 'Increase Visibility', true, '2017-10-13 06:31:39', '2017-10-13 06:31:39');
INSERT INTO `objective` (`id`, `name`, `is_active`, `update_at`, `create_at`) VALUES ('00000000-0000-0000-0000-000000000004', 'Build Advocates', true, '2017-10-13 06:31:39', '2017-10-13 06:31:39');


==========================================
CREATE TABLE `user_login`
(
  `id` varchar(36) NOT NULL,
  `access_token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
 `id_token` text NOT NULL,
  `token_expire` datetime NOT NULL,

 PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
)
 ENGINE=InnoDB DEFAULT CHARSET=utf8;


=========================================
ALTER TABLE `client_ranking_report`
ADD COLUMN `placement` VARCHAR(36) NULL DEFAULT 0 AFTER `client_id`;


==========================================
ALTER TABLE `client_history`
ADD COLUMN `team_email` VARCHAR(255) NULL AFTER `is_active_record`;

==========================================
CREATE TABLE `client_research_category`
(
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,

 `research_id` varchar(36) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,

PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

KEY `client_research_category_idx` (`client_id`),

KEY `research_research_category_idx` (`research_id`),

CONSTRAINT `client_research_category` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `research_research_category`
FOREIGN KEY (`research_id`) REFERENCES `research` (`id`)
ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


=========================================
CREATE TABLE `client_activity` (
  `id` varchar(36) NOT NULL,

 `client_id` varchar(36) NOT NULL,
  `desc` varchar(45) DEFAULT NULL,

  `date` date DEFAULT NULL,
  `is_active` bit(1) DEFAULT b'1',

  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `client_Client_activity_idx` (`client_id`),

  CONSTRAINT `client_Client_activity`
FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
ON DELETE NO ACTION ON UPDATE NO ACTION
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

========================================
CREATE TABLE `ranking_report_placement` (
  `id` varchar(36) NOT NULL,

 `custom_name` varchar(100) DEFAULT NULL,

 `client_id` varchar(36) DEFAULT NULL,

`create_at` datetime DEFAULT NULL,

PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

KEY `client_placement_idx` (`client_id`),

CONSTRAINT `client_placement`
FOREIGN KEY (`client_id`) REFERENCES `client` (`id`)
ON DELETE NO ACTION ON UPDATE NO ACTION
)
ENGINE=InnoDB DEFAULT CHARSET=utf8;

=========================================
ALTER TABLE `task`
ADD COLUMN `planning_designation` VARCHAR(2) NULL AFTER `debrief`;

ALTER TABLE `task`
ADD COLUMN `asana_project_id` VARCHAR(45) NULL AFTER `planning_designation`;


11/01/2018
=========================================

DELETE FROM `tag` WHERE `id` != '';

ALTER TABLE `tag`
ADD COLUMN `asana_id` VARCHAR(45) NULL AFTER `is_active`;


21/01/2018
=========================================
ALTER TABLE `task`
CHANGE COLUMN `debrief` `debrief` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ;


02/27/2018 (V1.3 Sprint 1)
======================================

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `user_client` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `is_active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `client_idx` (`client_id`),
  KEY `user_idx` (`user_id`),
  CONSTRAINT `client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `role` (
  `id` varchar(36) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `code` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ID_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
SELECT * FROM role;


CREATE TABLE `claim` (
  `id` varchar(36) NOT NULL,
  `claim_name` varchar(100) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `code` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
SELECT * FROM claim;


CREATE TABLE `role_claim` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `claim_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `role_role_id_idx` (`role_id`),
  KEY `claim_claim_id_idx` (`claim_id`),
  CONSTRAINT `claim_claim_id` FOREIGN KEY (`claim_id`) REFERENCES `claim` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `role_role_id` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `claim` VALUES ('00000000-0000-0000-0000-000000000001','See Navigation',1,'SEE_NAVIGATION'),('00000000-0000-0000-0000-000000000002','Read Only',1,'READ_ONLY'),('00000000-0000-0000-0000-000000000003','Client Health',1,'CLIENT_HEALTH'), ('00000000-0000-0000-0000-000000000004', 'Client Edit', '1', 'CLIENT_EDIT');

INSERT INTO `role` VALUES ('00000000-0000-0000-0000-000000000001','Spotlight Admin',1,'SPOTLIGHT_ADMIN'),('00000000-0000-0000-0000-000000000002','Spotlight Client Edit',1,'SPOTLIGHT_CLIENT_EDIT'),('00000000-0000-0000-0000-000000000003','Spotlight Client View',1,'SPOTLIGHT_CLIENT_VIEW');

INSERT INTO `role_claim` VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003'),('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002'), ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004');

02/28/2018
======================================================
ALTER TABLE `user`
CHANGE COLUMN `token` `access_token` TEXT NULL DEFAULT NULL ,
ADD COLUMN `token_expire` DATETIME NULL AFTER `access_token`;

DROP TABLE `user_login`;

03/01/2018
======================================================
ALTER TABLE `user`
ADD COLUMN `token_id` TEXT NULL AFTER `token_expire`;

03/15/2018
======================================================
ALTER TABLE `task`
CHANGE COLUMN `debrief` `debrief` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ;

03/23/2018
======================================================
ALTER TABLE `client_history`
ADD COLUMN `address` VARCHAR(255) CHARACTER SET 'utf8' NULL AFTER `team_email`,
ADD COLUMN `city` VARCHAR(100) CHARACTER SET 'utf8' NULL AFTER `address`,
ADD COLUMN `country` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `city`,
ADD COLUMN `state` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `country`;


CREATE TABLE `country` (
  `code` varchar(45) NOT NULL,
  `country_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `country`
VALUES ('AD','Andorra'),('AE','U.A.E.'),('AF','Afghanistan'),('AG','Antigua and Barbuda'),('AI','Anguilla'),('AL','Albania'),('AM','Armenia'),('AN','Netherland Antilles'),
('AO','Angola'),('AQ','Antartica'),('AR','Argentina'),('AS','American Samoa'),('AT','Austria'),('AU','Australia'),('AW','Aruba'),('AX','Åland Islands'),('AZ','Azerbaijan'),
('BA','Bosnia-Herzegovina'),('BB','Barbados'),('BD','Bangladesh'),('BE','Belgium'),('BF','Burkina Faso'),('BG','Bulgaria'),('BH','Bahrain'),('BI','Burundi'),('BJ','Benin'),
('BL','Saint Barthélemy'),('BM','Bermuda'),('BN','Brunei Darussalam'),('BO','Bolivia'),('BR','Brazil'),('BS','Bahamas'),('BT','Bhutan'),('BV','Bouvet Island'),
('BW','Botswana'),('BY','Belarus'),('BZ','Belize'),('CA','Canada'),('CC','Cocos (Keeling) Islands'),('CD','Congo Democratic Republic of'),('CF','Central African Republic'),
('CG','Congo'),('CH','Switzerland'),('CI','Cote D Ivoire'),('CK','Cook Islands'),('CL','Chile'),('CM','Cameroon'),('CN','China'),('CO','Colombia'),('CR','Costa Rica'),
('CV','Cape Verde'),('CX','Christmas Island'),('CY','Cyprus'),('CZ','Czech Republic'),('DE','Germany'),('DJ','Djibouti'),('DK','Denmark'),('DM','Dominica'),('DO','Dominican Republic'),
('DZ','Algeria'),('EC','Ecuador'),('EE','Estonia'),('EG','Egypt'),('EH','Western Sahara'),('ER','Eritrea'),('ES','Spain'),('ET','Ethiopia'),('FI','Finland'),('FJ','Fiji'),
('FK','Falkland Islands (Malvinas)'),('FM','Micronesia Fed. States of'),('FO','Faeroe Islands'),('FR','France'),('GA','Gabon'),('GB','United Kingdom'),('GD','Grenada'),
('GE','Georgia'),('GF','French Guiana'),('GG','Guernsey C.I.'),('GH','Ghana'),('GI','Gibraltar'),('GL','Greenland'),('GM','Gambia'),('GN','Guinea'),('GP','Guadeloupe'),
('GQ','Equatorial Guinea'),('GR','Greece'),('GS','South Georgia &amp, S Sandwich Isl'),('GT','Guatemala'),('GU','Guam'),('GW','Guinea-Bissau'),('GY','Guyana'),('HK','Hong Kong'),('HM','Heard and McDonald Islands'),('HN','Honduras'),('HR','Croatia'),('HT','Haiti'),('HU','Hungary'),('ID','Indonesia'),('IE','Ireland'),('IL','Israel'),('IM','Isle of Man'),('IN','India'),('IO','British Indian Ocean Territory'),('IQ','Iraq'),('IS','Iceland'),('IT','Italy'),('JE','Jersey C.I.'),('JM','Jamaica'),('JO','Jordan'),('JP','Japan'),('KE','Kenya'),('KG','Kyrgyzstan'),('KH','Cambodia'),('KI','Kiribati'),('KM','Comoros'),('KN','Saint Kitts and Nevis'),('KR','Korea South (Republic of Korea)'),('KW','Kuwait'),('KY','Cayman Islands'),('KZ','Kazakhstan'),('LA','Laos (LPDR)'),('LB','Lebanon'),('LC','Saint Lucia'),('LI','Liechtenstein'),('LK','Sri Lanka'),('LR','Liberia'),('LS','Lesotho'),('LT','Lithuania'),('LU','Luxembourg'),('LV','Latvia'),('LY','Libyan Arab Jamahiriya'),('MA','Morocco'),('MC','Monaco'),('MD','Moldova Republic of'),('ME','Montenegro'),('MF','Saint Martin'),('MG','Madagascar'),('MH','Marshall Islands'),('MK','Macedonia frmr Yugoslav Rep'),('ML','Mali'),('MM','Myanmar'),('MN','Mongolia'),('MO','Macau'),('MP','Northern Mariana Islands'),('MQ','Martinique'),('MR','Mauritania'),('MS','Montserrat'),('MT','Malta'),('MU','Mauritius'),('MV','Maldives'),('MW','Malawi'),('MX','Mexico'),('MY','Malaysia'),('MZ','Mozambique'),('NA','Namibia'),('NC','New Caledonia'),('NE','Niger'),('NF','Norfolk Island'),('NG','Nigeria'),('NI','Nicaragua'),('NL','Netherlands'),('NO','Norway'),('NP','Nepal'),('NR','Nauru'),('NT','Neutral Zone (Saudi/Iraq)'),('NU','Niue'),('NZ','New Zealand'),('OM','Oman'),('OTHER','Other'),('PA','Panama'),('PE','Peru'),('PF','French Polynesia'),('PG','Papua New Guinea'),('PH','Philippines'),('PK','Pakistan'),('PL','Poland'),('PM','St. Pierre and Miquelon'),('PN','Pitcairn'),('PR','Puerto Rico'),('PS','Palestinian Territory'),('PT','Portugal'),('PW','Palau'),('PY','Paraguay'),('PZ','Panama Canal Zone'),('QA','Qatar'),('RE','Reunion'),('RO','Romania'),('RS','Serbia'),('RU','Russian Federation'),('RW','Rwanda'),('SA','Saudi Arabia'),('SB','Solomon Islands'),('SC','Seychelles'),('SE','Sweden'),('SG','Singapore'),('SH','St. Helena'),('SI','Slovenia'),('SJ','Svalbard and Jan Mayen Islands'),('SK','Slovakia'),('SL','Sierra Leone'),('SM','San Marino'),('SN','Senegal'),('SO','Somalia'),('SR','Suriname'),('ST','Sao Tome and Principe'),('SV','El Salvador'),('SZ','Swaziland'),('TC','Turks and Caicos Islands'),('TD','Chad'),('TF','French Southern Territories'),('TG','Togo'),('TH','Thailand'),('TJ','Tajikistan'),('TK','Tokelau'),('TL','Timor-Leste'),('TM','Turkmenistan'),('TN','Tunisia'),('TO','Tonga'),('TP','East Timor'),('TR','Turkey'),('TT','Trinidad and Tobago'),('TV','Tuvalu'),('TW','Taiwan'),('TZ','Tanzania United Republic of'),('UA','Ukraine'),('UG','Uganda'),('UM','U.S.Minor Outlying Islands'),('US','United States'),('UY','Uruguay'),('UZ','Uzbekistan'),('VA','Vatican City State'),('VC','St. Vincent and the Grenadines'),('VE','Venezuela'),('VG','Virgin Islands (British)'),('VI','Virgin Islands U.S.'),('VN','Viet Nam'),('VU','Vanuatu'),('WF','Wallis and Futuna Islands'),('WS','Samoa'),('YE','Yemen Republic of'),('YT','Mayotte'),('YU','Yugoslavia'),('ZA','South Africa'),('ZM','Zambia'),('ZR','Zaire'),('ZW','Zimbabwe');

CREATE TABLE `state` (
  `code` varchar(45) NOT NULL,
  `state_name` varchar(100) DEFAULT NULL,
  `country_code` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`code`),
  KEY `country-state_idx` (`country_code`),
  CONSTRAINT `country-state` FOREIGN KEY (`country_code`) REFERENCES `country` (`code`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `state` VALUES ('AB','Alberta','CA'),('AK','Alaska','US'),('AL','Alabama','US'),('AR','Arkansas','US'),('AZ','Arizona','US'),('BC','British Columbia','CA'),('CA','California','US'),('CO','Colorado','US'),('CT','Connecticut','US'),('DC','District of Columbia','US'),('DE','Delaware','US'),('FL','Florida','US'),('GA','Georgia','US'),('HI','Hawaii','US'),('IA','Iowa','US'),('ID','Idaho','US'),('IL','Illinois','US'),('IN','Indiana','US'),('KS','Kansas','US'),('KY','Kentucky','US'),('LA','Louisiana','US'),('MA','Massachusetts','US'),('MB','Manitoba','CA'),('MD','Maryland','US'),('ME','Maine','US'),('MI','Michigan','US'),('MN','Minnesota','US'),('MO','Missouri','US'),('MS','Mississippi','US'),('MT','Montana','US'),('NB','New Brunswick','CA'),('NC','North Carolina','US'),('ND','North Dakota','US'),('NE','Nebraska','US'),('NH','New Hampshire','US'),('NJ','New Jersey','US'),('NL','Newfoundland','CA'),('NM','New Mexico','US'),('NS','Nova Scotia','CA'),('NT','Northwest Territories','CA'),('NU','Nunavut','CA'),('NV','Nevada','US'),('NY','New York','US'),('OH','Ohio','US'),('OK','Oklahoma','US'),('ON','Ontario','CA'),('OR','Oregon','US'),('PA','Pennsylvania','US'),('PE','Prince Edward Island','CA'),('PR','Puerto Rico','US'),('QC','Quebec','CA'),('RI','Rhode Island','US'),('SC','South Carolina','US'),('SD','South Dakota','US'),('SK','Saskatchewan','CA'),('TN','Tennessee','US'),('TX','Texas','US'),('UT','Utah','US'),('VA','Virginia','US'),('VT','Vermont','US'),('WA','Washington','US'),('WI','Wisconsin','US'),('WV','West Virginia','US'),('WY','Wyoming','US'),('YT','Yukon','CA');

03/30/2018
======================================================
INSERT INTO claim (id, claim_name, is_active,code) VALUES ("00000000-0000-0000-0000-000000000005", "Briefing Request", 1,"BRIEFING_REQUEST")
INSERT INTO `role_claim` VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000005')


04/02/2018
======================================================
DROP TABLE `user_client`

CREATE TABLE `request_briefing` (
  `id` VARCHAR(36) NOT NULL,
  `task_id` VARCHAR(45) NOT NULL,
  `submit_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

======================================================
ALTER TABLE `analyst_history`
ADD COLUMN `is_access` bit(1) DEFAULT NULL AFTER `team`;
ADD COLUMN `email` VARCHAR(100) CHARACTER SET 'utf8' NULL AFTER `is_access`,
ADD COLUMN `phone` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `email`,
ADD COLUMN `twitter` VARCHAR(100) CHARACTER SET 'utf8' NULL AFTER `phone`,
ADD COLUMN `city` VARCHAR(100) CHARACTER SET 'utf8' NULL AFTER `twitter`,
ADD COLUMN `country` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `city`,
ADD COLUMN `state` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `country`,
ADD COLUMN `region` VARCHAR(36) CHARACTER SET 'utf8' NULL AFTER `state`;

CREATE TABLE `region`(
  `region_name` varchar(255) NOT NULL,
   `code` varchar(45) NOT NULL,
   PRIMARY KEY(`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `region` VALUES ('Asia Pacific (Tokyo)','ap-northeast-1'),('Asia Pacific (Seoul)','ap-northeast-2'),('Asia Pacific (Osaka-Local)','ap-northeast-3'),('Asia Pacific (Mumbai)','ap-south-1'),('Asia Pacific (Singapore)','ap-southeast-1'),('Asia Pacific (Sydney)','ap-southeast-2'),('Canada (Central)','ca-central-1'),('China (Beijing)','cn-north-1'),('EU (Frankfurt)','eu-central-1'),('EU (Ireland)','eu-west-1'),('EU (London)','eu-west-2'),('EU (Paris)','eu-west-3'),('South America (Sao Paulo)','sa-east-1'),('US East (N. Virginia)','us-east-1'),('US East (Ohio)','us-east-2'),('US West (N. California)','us-west-1'),('US West (Oregon)','us-west-2');

04/09/2018
===========================================================
CREATE TABLE `client_resources`
 (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,

  `resource_name` VARCHAR(150) NOT NULL,

  `detail` text DEFAULT NULL,

  `is_active` bit(1) DEFAULT NULL,

  `create_at` datetime DEFAULT NULL,

  `update_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

 KEY `client_resources-client_idx` (`client_id`),

  CONSTRAINT `client_resources-client` FOREIGN KEY (`client_id`)
 REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

04/11/2018
======================================================
ALTER TABLE `client_history`
ADD COLUMN `phone` VARCHAR(15) NULL AFTER `state`,
ADD COLUMN `zip_code` VARCHAR(15) NULL AFTER `phone`,
ADD COLUMN `website_url` VARCHAR(200) NULL AFTER `zip_code`,
ADD COLUMN `profile_description` VARCHAR(500) CHARACTER SET 'utf8' NULL AFTER `website_url`;

04/12/2018
======================================================
ALTER TABLE user`
ADD COLUMN `first_login` BIT(1) NULL DEFAULT 0 AFTER `token_id`;

ALTER TABLE `client_history`
ADD COLUMN `influence` TEXT  AFTER `state`;

04/17/2018
======================
CREATE TABLE `reason_change_maturity`
 (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,

  `analyst_id` varchar(36) DEFAULT NULL,

  `reason_change_maturity` text DEFAULT NULL,

  `maturity_old` varchar(100) ,

  `maturity_new` varchar(100) ,

  `create_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),

 KEY `reason_change_maturity-client_idx` (`client_id`),

  KEY `reason_change_maturity-analyst_idx` (`analyst_id`),

  CONSTRAINT `reason_change_maturity-analyst` FOREIGN KEY (`analyst_id`)
 REFERENCES `analyst` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,

  CONSTRAINT `reason_change_maturity-client` FOREIGN KEY (`client_id`)
 REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


05/02/2018
======================
CREATE TABLE `table_config` (
  `id` VARCHAR(36) NOT NULL,
  `table_name` VARCHAR(45) CHARACTER SET 'utf8' NULL,
  `column_name` VARCHAR(500) CHARACTER SET 'utf8' NULL,
  `email` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

05/04/2018
======================
ALTER TABLE analyst_history`
ADD COLUMN `ad_owner` VARCHAR(150) NULL AFTER `region`;

05/15/2018
===========================
CREATE TABLE `object_templates` (
  `id` varchar(36) NOT NULL,
  `template_name` varchar(100) DEFAULT NULL,
  `object` varchar(100) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `groups` (
  `id` varchar(36) NOT NULL,
  `index` int(11) NOT NULL,
  `template_id` varchar(36) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `visibility` bit(1) NOT NULL,
  `last_update` datetime DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `group_templates_idx` (`template_id`),
  CONSTRAINT `group_templates` FOREIGN KEY (`template_id`) REFERENCES `object_templates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `items` (
  `id` varchar(36) NOT NULL,
  `index` int(11) NOT NULL,
  `group_id` varchar(36) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `item_type` bit(1) NOT NULL,
  `item_value` varchar(200) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `item_group_idx` (`group_id`),
  CONSTRAINT `item_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000001', 'Analyst Profile', 'Analyst', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000002', 'Category Detail', 'Category', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000003', 'Client Profile', 'Client', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000004', 'Event Detail', 'Event', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000005', 'Activity Detail', 'Activity', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000006', 'Report Profile', 'Report', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000007', 'Reasearch Firm Detail', 'Research Firm', '2018-05-15 00:00:00');
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`) VALUES ('00000000-0000-0000-0000-000000000008', 'Speaker Profile', 'Speaker', '2018-05-15 00:00:00');

05/18/2018
=====================================
CREATE TABLE change_log` (
  `id` VARCHAR(36) NOT NULL,
  `section` VARCHAR(100) NULL,
  `summary` VARCHAR(500) NULL,
  `user` VARCHAR(100) NULL,
  `date` DATETIME NULL,
  `page` VARCHAR(45) NULL ,
 `object_id` VARCHAR(36)`,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `analyst_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `analyst_id` VARCHAR(36) NOT NULL,
  `detail` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

05/24/2018
===========================================
CREATE TABLE `firm_research` (
   `firm_id` varchar(36) NOT NULL,
   `research_id` varchar(36) NOT NULL,
   PRIMARY KEY (`firm_id`,`research_id`),
   KEY `fk_ah_research_table_idx` (`research_id`),
   CONSTRAINT `fk_ah_firm_table` FOREIGN KEY (`firm_id`) REFERENCES `firm` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
   CONSTRAINT `fk_ah_research_table` FOREIGN KEY (`research_id`) REFERENCES `research` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8

25/5/2018
============
CREATE TABLE `client_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `client_id` VARCHAR(36) NOT NULL,
  `detail` VARCHAR(500) NOT NULL,
  `is_active` BIT(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `client-item-items_idx` (`item_id` ASC),
  INDEX `client-item-clients_idx` (`client_id` ASC),
  CONSTRAINT `client-item-items`
    FOREIGN KEY (`item_id`)
    REFERENCES `items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `client-item-clients`
    FOREIGN KEY (`client_id`)
    REFERENCES `client` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

29/10/2018
==============================
CREATE TABLE `client_groups` (
  `id` VARCHAR(36) NOT NULL,
  `client_id` VARCHAR(36) NOT NULL,
  `index` INT NOT NULL,
  `is_active` BIT(1) NOT NULL,
  `last_update` DATETIME NOT NULL,
  `group_name` VARCHAR(100) NOT NULL,
  `visibility` BIT(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `client_group_client_idx` (`client_id` ASC),
  CONSTRAINT `client_group_client`
    FOREIGN KEY (`client_id`)
    REFERENCES `client` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8

30/5/2018
===========================
ALTER TABLE `client_history`
ADD COLUMN `client_speakers` VARCHAR(500) NULL AFTER `profile_description`,
ADD COLUMN `client_assigned` VARCHAR(500) NULL AFTER `client_speakers`;
ALTER TABLE `groups`
ADD COLUMN `client_id` VARCHAR(36) NULL AFTER `is_active`;


06/01/2018
=====================
CREATE TABLE `firm-item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NULL,
  `detail` VARCHAR(500) NULL,
  `is_active` BIT(1) NULL,
  `firm_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `firm-item-item_idx` (`item_id` ASC),
  CONSTRAINT `firm-item-item`
    FOREIGN KEY (`item_id`)
    REFERENCES `items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `firm-item-firm`
    FOREIGN KEY (`firm_id`)
    REFERENCES `firm` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `report_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NULL,
  `detail` VARCHAR(500) NULL,
  `is_active` BIT(1) NULL,
  `report_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `report-item-item_idx` (`item_id` ASC),
  CONSTRAINT `report-item-item`
    FOREIGN KEY (`item_id`)
    REFERENCES `items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `report-item-report`
    FOREIGN KEY (`report_id`)
    REFERENCES `ranking_report` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

07/06/2018
==============================
ALTER TABLE `ranking_report`
ADD COLUMN `update_date` DATETIME NULL AFTER `is_active`;

08/06/2018
==============================
CREATE TABLE `research_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NULL,
  `research_id` VARCHAR(36) NULL,
  `detail` VARCHAR(500) NULL,
  `is_active` BIT(1) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `research_item_item_idx` (`item_id` ASC),
  INDEX `research_item_research_idx` (`research_id` ASC),
  CONSTRAINT `research_item_item`
    FOREIGN KEY (`item_id`)
    REFERENCES `items` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `research_item_research`
    FOREIGN KEY (`research_id`)
    REFERENCES `research` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

11/06/2018
==============================
ALTER TABLE `research`
ADD COLUMN `last_update` DATETIME NULL AFTER `is_active`;


12/06/2018
Add segment, sub_segment, sub_segment_analyst
================================================

Table structure for table `segment`

CREATE TABLE `segment` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `client_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-
Table structure for table `sub_segment`

CREATE TABLE `sub_segment` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `segment_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


 Table structure for table `sub_segment_analyst`

CREATE TABLE `sub_segment_analyst` (
  `sub_segment_id` varchar(36) NOT NULL,
  `analyst_id` varchar(36) NOT NULL,
  PRIMARY KEY (`sub_segment_id`,`analyst_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

=====================
ALTER TABLE `sub_segment`
ADD COLUMN `detail` VARCHAR(500) NULL AFTER `segment_id`;


14/06/2018
seed data
=====================

INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`, `is_active`)
VALUES ('00000000-0000-0000-0000-000000000009', 'Analyst Client View', 'Analyst', '2018-06-14 00:00:00', 0);

ALTER TABLE `segment`
ADD COLUMN `is_maturity` BIT(1) NULL DEFAULT 0 AFTER `client_id`;

INSERT INTO `segment` (`id`, `name`, `is_maturity`) VALUES ('765936fc-6fa8-11e8-adc0-fa7ae01bbebc', 'Maturity', b'1');

INSERT INTO `sub_segment` (`id`, `name`, `segment_id`) VALUES ('2efe6084-6fa8-11e8-adc0-fa7ae01bbebc', '1-Detractor', '765936fc-6fa8-11e8-adc0-fa7ae01bbebc');
INSERT INTO `sub_segment` (`id`, `name`, `segment_id`) VALUES ('43709870-6fa8-11e8-adc0-fa7ae01bbebc', '2-Stranger', '765936fc-6fa8-11e8-adc0-fa7ae01bbebc');
INSERT INTO `sub_segment` (`id`, `name`, `segment_id`) VALUES ('4d300f4e-6fa8-11e8-adc0-fa7ae01bbebc', '3-Acquaintance', '765936fc-6fa8-11e8-adc0-fa7ae01bbebc');
INSERT INTO `sub_segment` (`id`, `name`, `segment_id`) VALUES ('5c8e400a-6fa8-11e8-adc0-fa7ae01bbebc', '4-Friendly', '765936fc-6fa8-11e8-adc0-fa7ae01bbebc');
INSERT INTO `sub_segment` (`id`, `name`, `segment_id`) VALUES ('662c6952-6fa8-11e8-aad9-fa7ae01bbebc', '5-Advocate', '765936fc-6fa8-11e8-adc0-fa7ae01bbebc');

19/06/2018

=====================

ALTER TABLE `segment`
DROP COLUMN `is_maturity`;

CREATE TABLE `global_setting` (
  `id` NVARCHAR(36) NOT NULL,
  `name` TEXT NOT NULL,
  `last_updated` DATETIME NULL DEFAULT NULL,
  `action` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

INSERT INTO `global_setting` (`id`, `name`, `last_updated`, `action`) VALUES ('01f5319a-71ca-4535-8e1b-290464b65d2c', 'Segments', NOW(), 'segment');

ALTER TABLE `sub_segment_analyst`
ADD COLUMN `client_id` VARCHAR(36) NOT NULL AFTER `analyst_id`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`sub_segment_id`, `analyst_id`, `client_id`);

20/6/2018
=====================

ALTER TABLE `firm`
ADD COLUMN `media_id` VARCHAR(36) NULL AFTER `name`;
ALTER TABLE `groups`
ADD COLUMN `firm_id` VARCHAR(36) NULL DEFAULT NULL AFTER `client_id`;
=======

22/06/2018
======================
-- Please call API: api/clients/migrate-data-maturity to migrate maturity data from v1.3 to v2.0

-- Migrate data for activity and speaker feature: Please run script on file speaker_activity.sql

25/6/2018
========================
CREATE TABLE `event` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `start_date` DATETIME  NULL,
  `end_date` DATETIME  NULL,
  `last_update` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `event_analyst` (
  `event_id` VARCHAR(36) NOT NULL,
  `analyst_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`event_id`, `analyst_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `event_client` (
  `event_id` VARCHAR(36) NOT NULL,
  `client_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`client_id`, `event_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE `event_category` (
  `event_id` VARCHAR(36) NOT NULL,
  `research_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`research_id`, `event_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

26/6/2018
==========
ALTER TABLE `groups`
ADD COLUMN `event_id` VARCHAR(36) NULL AFTER `firm_id`;

=======
/* spot 521 */
CREATE TABLE `client_speaker` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `comment` longtext,
  `client_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `speakerId_UNQ` (`id`),
  KEY `fk_client_speaker_client_id_idx` (`client_id`),
  CONSTRAINT `fk_client_speaker_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `client_speaker_media` (
  `id` varchar(36) NOT NULL,
  `media_id` varchar(36) DEFAULT NULL,
  `media_type` varchar(45) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `client_speaker_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `analyst_media_analyst_idx` (`client_speaker_id`),
  KEY `analyst_media_media_idx` (`media_id`),
  CONSTRAINT `client_speaker_media_speaker` FOREIGN KEY (`client_speaker_id`) REFERENCES `client_speaker` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `client_speaker_media_media` FOREIGN KEY (`media_id`) REFERENCES `media` (`media_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/* spot 532 */
CREATE TABLE `activity` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(36) DEFAULT NULL,
  `speakers` varchar(250) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `quarter` int(11) DEFAULT NULL,
  `topic` varchar(100) DEFAULT NULL,
  `sentiment` varchar(100) DEFAULT NULL,
  `type_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activityId_UNQ` (`id`),
  KEY `fk_activity_client_id_idx` (`client_id`),
  KEY `fk_activity_type_id_idx` (`type_id`),
  CONSTRAINT `fk_activity_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_type_id` FOREIGN KEY (`type_id`) REFERENCES `task_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `activity_analyst` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `analyst_id` varchar(36) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `activitySpeakerId_UNQ` (`id`),
  KEY `fk_activity_analyst_activity_id_idx` (`activity_id`),
  KEY `fk_activity_analystr_analystr_id_idx` (`analyst_id`),
  CONSTRAINT `fk_activity_analyst_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_analyst_analyst_id` FOREIGN KEY (`analyst_id`) REFERENCES `analyst` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `activity_speaker` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `speaker_id` varchar(36) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `activitySpeakerId_UNQ` (`id`),
  KEY `fk_activity_speaker_activity_id_idx` (`activity_id`),
  KEY `fk_activity_speaker_speaker_id_idx` (`speaker_id`),
  CONSTRAINT `fk_activity_speaker_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_speaker_speaker_id` FOREIGN KEY (`speaker_id`) REFERENCES `client_speaker` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `activity_event` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `event_id` varchar(36) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `activityEventId_UNQ` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `activity_report` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `report_id` varchar(36) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `activityReportId_UNQ` (`id`),
  KEY `fk_activity_report_activity_id_idx` (`activity_id`),
  KEY `fk_activity_report_report_id_idx` (`report_id`),
  CONSTRAINT `fk_activity_report_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_report_report_id` FOREIGN KEY (`report_id`) REFERENCES `ranking_report` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `activity_category` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `category_id` varchar(36) DEFAULT NULL,
   PRIMARY KEY (`id`),
  UNIQUE KEY `activityCategoryd_UNQ` (`id`),
  KEY `fk_activity_category_activity_id_idx` (`activity_id`),
  KEY `fk_activity_category_category_id_idx` (`category_id`),
  CONSTRAINT `fk_activity_category_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_activity_category_category_id` FOREIGN KEY (`category_id`) REFERENCES `research` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO activity (id, client_id, date,quarter,topic,type_id, speakers)
select t.id, c.id, t.date ,t.quarter, t.topic, tt.id, t.speakers from task as t
      left join task_interaction as ti on t.id = ti.task_id
      left join interaction_type as it on ti.interaction_id = it.id
      left join task_type as tt on tt.id = it.task_type_id
      left join analyst as a on a.id = t.analyst_id
      left join client as c on c.id = t.client_id;

INSERT INTO activity_analyst (id, activity_id, analyst_id)
select UUID(), t.id, a.id from task as t
      left join task_interaction as ti on t.id = ti.task_id
      left join interaction_type as it on ti.interaction_id = it.id
      left join task_type as tt on tt.id = it.task_type_id
      left join analyst as a on a.id = t.analyst_id
      left join client as c on c.id = t.client_id;

CREATE TABLE `activity_item` (
  `id` varchar(36) NOT NULL,
  `item_id` varchar(36) NOT NULL,
  `activity_id` varchar(36) NOT NULL,
  `detail` varchar(500) NOT NULL,
  `is_active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `activity-item-items_idx` (`item_id`),
  KEY `activity-item-activitys_idx` (`activity_id`),
  CONSTRAINT `activity-item-activitys` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `activity-item-items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

25/06/2018
Create table for "Analyst Client View" object_template
=====================

CREATE TABLE `analyst_client_view_item` (
  `id` NVARCHAR(36) NOT NULL,
  `item_id` NVARCHAR(36) NULL,
  `analyst_id` NVARCHAR(36) NULL,
  `client_id` NVARCHAR(36) NULL,
  `detail` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

29/06/2018
=========================
CREATE TABLE `note` (
  `id` varchar(36) NOT NULL,
  `note_type` varchar(45) DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  `description` text,
  `analyst_id` varchar(500) DEFAULT NULL,
  `note_status` bit(1) DEFAULT NULL,
  `activity_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


====================
CREATE TABLE `event_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NULL,
  `event_id` VARCHAR(36) NULL,
  `detail` TEXT NULL,
  `is_active` TINYINT(1) NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `activity`
CHANGE COLUMN `date` `due_date` DATE NULL DEFAULT NULL ,
ADD COLUMN `start_date` DATE NULL DEFAULT NULL AFTER `speakers`;

07/05/2018
=========================
CREATE TABLE `insight` (
  `id` VARCHAR(36) NOT NULL,
  `checked_by_users` VARCHAR(500) NULL,
  `created_by` VARCHAR(50) NOT NULL,
  `type` int NULL,
  `sensitivity` int NULL,
  `is_active` BIT(1) NULL,
  `created_date` DATETIME NOT NULL,
  `updated_date` DATETIME NOT NULL,
  `published_date` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `insight_id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_client` (
  `id` varchar(36) NOT NULL,
   `client_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_insight_id_UNQ` (`id`),
  KEY `fk_client_insight_client_id_idx` (`client_id`),
  KEY `fk_client_insight_insight_id_idx` (`insight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_analyst` (
  `id` varchar(36) NOT NULL,
   `analyst_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `analyst_insight_id_UNQ` (`id`),
  KEY `fk_analyst_insight_analyst_id_idx` (`analyst_id`),
  KEY `fk_analyst_insight_insight_id_idx` (`insight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_activity` (
  `id` varchar(36) NOT NULL,
   `activity_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activity_insight_id_UNQ` (`id`),
  KEY `fk_activity_insight_activity_id_idx` (`activity_id`),
  KEY `fk_activity_insight_insight_id_idx` (`insight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_event` (
  `id` varchar(36) NOT NULL,
   `event_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_insight_id_UNQ` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_report` (
  `id` varchar(36) NOT NULL,
   `report_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_insight_id_UNQ` (`id`),
  KEY `fk_report_insight_report_id_idx` (`report_id`),
  KEY `fk_report_insight_insight_id_idx` (`insight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `insight_category` (
  `id` varchar(36) NOT NULL,
   `category_id` varchar(36) DEFAULT NULL,
   `insight_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_insight_id_UNQ` (`id`),
  KEY `fk_category_insight_category_id_idx` (`category_id`),
  KEY `fk_category_insight_insight_id_idx` (`insight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
=================================

9/7/2018
========================
ALTER TABLE `note`
ADD COLUMN `activity_type` VARCHAR(36) NOT NULL AFTER `note_status`

11/07/2018
========================
ALTER TABLE `activity`
CHANGE COLUMN `start_date` `start_date` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `due_date` `due_date` DATETIME NULL DEFAULT NULL ;

ALTER TABLE insight
ADD COLUMN `desc` VARCHAR(500) NULL AFTER `id`;
ALTER TABLE insight
ADD COLUMN `sentiment` Int NULL AFTER `id`;

16/07/2018
=======================
ALTER TABLE `activity`
ADD COLUMN `name` VARCHAR(500) NULL AFTER `type_id`;

SET SQL_SAFE_UPDATES = 0;
update activity
INNER JOIN
	(select ac.id, CONCAT(tt.desc, ' with ', GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') ,' on ' , ac.due_date) as name from
	activity as ac, activity_analyst aa, task_type as tt, analyst as a
	where ac.start_date is null and ac.id = aa.activity_id and tt.id = ac.type_id and a.id = aa.analyst_id
	group by ac.id) as temp
ON activity.id = temp.id
SET activity.name = temp.name;
SET SQL_SAFE_UPDATES = 1;

 SET SQL_SAFE_UPDATES = 0;
update activity
INNER JOIN
	(select ac.id, CONCAT(tt.desc, ' with ', GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') ,' from ' , ac.start_date, ' to ', ac.due_date) as name from
	activity as ac, activity_analyst aa, task_type as tt, analyst as a
	where ac.start_date is not null and ac.id = aa.activity_id and tt.id = ac.type_id and a.id = aa.analyst_id
	group by ac.id) as temp
ON activity.id = temp.id
SET activity.name = temp.name;
SET SQL_SAFE_UPDATES = 1;

ALTER TABLE `insight`
CHANGE COLUMN `desc` `desc` TEXT(5000) NULL DEFAULT NULL ;


19/07/2018
================
ALTER TABLE `media`
ADD COLUMN `small_media_data` LONGBLOB NULL DEFAULT NULL AFTER `created_date`


27/07/2018
================
ALTER TABLE `activity`
ADD COLUMN `topic_ge` TEXT NULL DEFAULT NULL AFTER `name`,
ADD COLUMN `description` TEXT NULL DEFAULT NULL AFTER `topic_ge`,
ADD COLUMN `debrief` TEXT NULL DEFAULT NULL AFTER `description`,
ADD COLUMN `asana_id` VARCHAR(36) NULL DEFAULT NULL AFTER `debrief`;

-- If re-sync request is approved, we will run this script
-- delete all activity table and re-sync data from asana-task to activity
---------------------------------------
-- INSERT INTO activity (id, client_id, due_date, quarter, topic, type_id, speakers, topic_ge, description, debrief, asana_id)
-- select t.id, c.id, ADDTIME(t.date, "12:00:00") ,t.quarter, t.topic, tt.id, t.speakers, t.topic_ge, t.description, t.debrief, t.asana_id from task as t
--       left join task_interaction as ti on t.id = ti.task_id
--       left join interaction_type as it on ti.interaction_id = it.id
--       left join task_type as tt on tt.id = it.task_type_id
--       left join analyst as a on a.id = t.analyst_id
--       left join client as c on c.id = t.client_id;

-- INSERT INTO activity_analyst (id, activity_id, analyst_id)
-- select UUID(), t.id, a.id from task as t
--       left join task_interaction as ti on t.id = ti.task_id
--       left join interaction_type as it on ti.interaction_id = it.id
--       left join task_type as tt on tt.id = it.task_type_id
--       left join analyst as a on a.id = t.analyst_id
--       left join client as c on c.id = t.client_id;

-- SPRINT 8
---------------------

31/07/2018
================
ALTER TABLE `change_log`
CHANGE COLUMN `summary` `summary` TEXT NULL DEFAULT NULL ,
ADD COLUMN `group_id` VARCHAR(36) NULL AFTER `object_id`,
ADD COLUMN `old_value` TEXT NULL AFTER `group_id`;

31/07/2018
================
CREATE TABLE `activity_log` (
  `id` varchar(36) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `parent_object_id` varchar(36) DEFAULT NULL,
  `parent_object_model` varchar(255) DEFAULT NULL,
  `object_id` varchar(36) DEFAULT NULL,
  `new_value` text,
  `old_value` text,
  `user` varchar(255) DEFAULT NULL,
  `data_model` text,
  `object_group_id` varchar(36) DEFAULT NULL,
  `page` varchar(255) DEFAULT NULL,
  `section` varchar(255) DEFAULT NULL,
  `object_meta_data` varchar(255) DEFAULT NULL,
  `update_date` datetime DEFAULT NULL,
  `log_type` int(11) DEFAULT NULL,
  `object_model` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `user`
ADD COLUMN `full_name` VARCHAR(255) NULL AFTER `first_login`;

-- call API to migrate data aws to user. (get full name and set to table user)
/api/defaultData/migrate-data-aws


-- 01/08/2018
-----------------------------------
CREATE TABLE `collection` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NULL DEFAULT NULL,
  `created_at` DATETIME NULL DEFAULT NULL,
  `updated_at` DATETIME NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

CREATE TABLE `collection_client` (
  `id` VARCHAR(36) NOT NULL,
  `collection_id` VARCHAR(36) NULL,
  `client_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`));

-- 02/08/2018
-----------------------------------
CREATE TABLE `market` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NULL DEFAULT NULL,
  `created_at` DATETIME NULL DEFAULT NULL,
  `updated_at` DATETIME NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

CREATE TABLE `market_category` (
  `id` VARCHAR(36) NOT NULL,
  `market_id` VARCHAR(36) NULL,
  `category_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`));

-- 07/08/2018
-----------------------------------
CREATE TABLE `market_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `market_id` VARCHAR(36) NOT NULL,
  `detail` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`, `is_active`) VALUES ('00000000-0000-0000-0000-000000000010', 'Market Detail', 'Market', '2018-08-07 10:39:41', 0);


-- 07/08/2018
-----------------------------------
ALTER TABLE `note`
ADD COLUMN `start_date` DATETIME NULL AFTER `activity_id`,
ADD COLUMN `end_date` DATETIME NULL AFTER `start_date`;

-- 14/08/2018
ALTER TABLE `client_history`
ADD COLUMN `collection_id` VARCHAR(36) NULL DEFAULT NULL AFTER `client_assigned`;

-- 16/08/2018
-----------------------------------
ALTER TABLE `activity`
CHANGE COLUMN `topic` `topic` TEXT NULL DEFAULT NULL ;

ALTER TABLE `task_type`
ADD COLUMN `kind` VARCHAR(45) NULL DEFAULT 'Standard' AFTER `is_active`;
UPDATE `task_type` SET `kind`='Outcome' WHERE `id`='82469ea6-5b6f-11e7-9e87-06bd29fac5dd';
UPDATE `task_type` SET `kind`='Outcome' WHERE `id`='8255675f-5b6f-11e7-9e87-06bd29fac5dd';

-- 16/08/2018
-----------------------------------
ALTER TABLE `event`
ADD COLUMN `location` VARCHAR(500) NULL AFTER `last_update`;

-- 20/08/2018
---------------------
ALTER TABLE `groups`
ADD COLUMN `market_id` VARCHAR(36) NULL DEFAULT NULL AFTER `event_id`;
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000001';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000002';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000003';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000004';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000005';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000006';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000007';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000008';
UPDATE `object_templates` SET `is_active`=1 WHERE `id`='00000000-0000-0000-0000-000000000009';
-----------------------------------
ALTER TABLE `client_health_history`
ADD COLUMN `created_date` DATETIME NOT NULL AFTER `user_comment`;
-- 21/8/2018
--------------------
ALTER TABLE `groups`
ADD COLUMN `report_id` VARCHAR(36) NULL DEFAULT NULL AFTER `market_id`;
ALTER TABLE `report_item`
CHANGE COLUMN `detail` `detail` TEXT NULL DEFAULT NULL ;
-- 22/8/2018
--------------------
ALTER TABLE `insight`
ADD COLUMN `insight_status` TINYINT(1) NULL DEFAULT 0 AFTER `published_date`;

CREATE TABLE `publish_link` (
  `id` varchar(36) NOT NULL,
  `object_id` varchar(36) DEFAULT NULL,
  `object_model` varchar(255) DEFAULT NULL,
  `object_metadata` varchar(255) DEFAULT NULL,
  `exprire` datetime DEFAULT NULL,
  `create_date` datetime DEFAULT NULL,
  `token` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 23/8/2018
--------------------
ALTER TABLE `ranking_report`
ADD COLUMN `nickname` VARCHAR(100) NULL AFTER `update_date`;

ALTER TABLE `ranking_report`
ADD COLUMN `major_report` TINYINT(1) NULL AFTER `nickname`;

ALTER TABLE `ranking_report`
ADD COLUMN `client_type` VARCHAR(10) NULL AFTER `major_report`;

-- 31/08/2018
INSERT INTO `global_setting` (`id`, `name`, `last_updated`, `action`) VALUES ('bde67290-50c1-4f4c-ab9c-e633f615a20d', 'Activity types', '2018-08-31 14:26:20 ', 'activity_type');

-- 04/09/2018
ALTER TABLE `task_type`
ADD COLUMN `index` INT NULL DEFAULT 999 AFTER `kind`;

UPDATE `task_type` SET `desc`='Cited', `kind`='Outcome Report' WHERE `id`='82469ea6-5b6f-11e7-9e87-06bd29fac5dd';
UPDATE `task_type` SET `kind`='Outcome' WHERE `id`='828b33bc-5b6f-11e7-9e87-06bd29fac5dd';
UPDATE `task_type` SET `kind`='Outcome' WHERE `id`='8295d2fc-5b6f-11e7-9e87-06bd29fac5dd';
UPDATE `task_type` SET `kind`='Outcome Report' WHERE `id`='8255675f-5b6f-11e7-9e87-06bd29fac5dd';


-- New Views
CREATE ALGORITHM=UNDEFINED DEFINER=`Dev27`@`%` SQL SECURITY DEFINER VIEW `all_activity_task` AS (select `a`.`id` AS `id`,`a`.`name` AS `name`,`c`.`name` AS `client_name`,`c`.`id` AS `client_id`,`tt`.`desc` AS `type`,`tt`.`kind` AS `type_kind`,`a`.`start_date` AS `start_date`,`a`.`due_date` AS `due_date`,`a`.`topic` AS `topic`,`a`.`debrief` AS `debrief`,`a`.`description` AS `desc`,`a`.`sentiment` AS `sentiment`,group_concat(distinct `an`.`name` separator ', ') AS `all_analyst`,group_concat(distinct `an`.`id` separator ', ') AS `all_analyst_id`,group_concat(distinct `csp`.`name` separator ', ') AS `all_speaker`,'activity' AS `source` from ((((((`activity` `a` left join `client` `c` on((`c`.`id` = `a`.`client_id`))) left join `task_type` `tt` on((`tt`.`id` = `a`.`type_id`))) left join `activity_analyst` `aa` on((`a`.`id` = `aa`.`activity_id`))) left join `analyst` `an` on((`an`.`id` = `aa`.`analyst_id`))) left join `activity_speaker` `asp` on((`a`.`id` = `asp`.`activity_id`))) left join `client_speaker` `csp` on((`csp`.`id` = `asp`.`speaker_id`))) group by `a`.`id`) union (select `t`.`id` AS `id`,`t`.`task_name` AS `name`,`c`.`name` AS `client_name`,`c`.`id` AS `client_id`,`tt`.`desc` AS `type`,`tt`.`kind` AS `type_kind`,NULL AS `start_date`,`t`.`date` AS `due_date`,`t`.`topic` AS `topic`,`t`.`debrief` AS `debrief`,`t`.`description` AS `desc`,`t`.`sentiment` AS `sentiment`,`an`.`name` AS `all_analyst`,`an`.`id` AS `all_analyst_id`,`t`.`speakers` AS `all_speaker`,'task' AS `source` from (((((`task` `t` left join `client` `c` on((`t`.`client_id` = `c`.`id`))) left join `task_interaction` `ti` on((`t`.`id` = `ti`.`task_id`))) left join `interaction_type` `it` on((`ti`.`interaction_id` = `it`.`id`))) left join `task_type` `tt` on((`tt`.`id` = `it`.`task_type_id`))) left join `analyst` `an` on((`an`.`id` = `t`.`analyst_id`)))) order by `due_date` desc;

CREATE ALGORITHM=UNDEFINED DEFINER=`Dev27`@`%` SQL SECURITY DEFINER VIEW `all_task_activity` AS (select `task`.`id` AS `id`,`task`.`asana_id` AS `asana_id`,`task`.`client_id` AS `client_id`,`task`.`analyst_id` AS `analyst_id`,`task`.`task_name` AS `task_name`,`task`.`date` AS `date`,`task`.`quarter` AS `quarter`,`task`.`description` AS `description`,`task`.`subtask_names` AS `subtask_names`,`task`.`comments` AS `comments`,`task`.`topic_ge` AS `topic_ge`,`task`.`core_status` AS `core_status`,`task`.`firm_id` AS `firm_id`,`task`.`speakers` AS `speakers`,`task`.`sentiment` AS `sentiment`,`task`.`primary_objective` AS `primary_objective`,`task`.`secondaryObjective` AS `secondaryObjective`,`task`.`topic` AS `topic`,`task`.`asana_name` AS `asana_name`,`task`.`debrief` AS `debrief`,`task`.`planning_designation` AS `planning_designation`,`task`.`asana_project_id` AS `asana_project_id`,`tt`.`desc` AS `desc` from (((`task` left join `task_interaction` `ti` on((`task`.`id` = `ti`.`task_id`))) left join `interaction_type` `it` on((`ti`.`interaction_id` = `it`.`id`))) left join `task_type` `tt` on((`tt`.`id` = `it`.`task_type_id`)))) union (select `a`.`id` AS `id`,`a`.`asana_id` AS `asana_id`,`a`.`client_id` AS `client_id`,`aa`.`analyst_id` AS `analyst_id`,`a`.`name` AS `task_name`,`a`.`due_date` AS `date`,`a`.`quarter` AS `quarter`,`a`.`description` AS `description`,'' AS `subtask_names`,'' AS `comments`,`a`.`topic_ge` AS `topic_ge`,'' AS `core_status`,NULL AS `firm_id`,`a`.`speakers` AS `speakers`,`a`.`sentiment` AS `sentiment`,'' AS `primary_objective`,'' AS `secondaryObjective`,`a`.`topic` AS `topic`,'' AS `asana_name`,`a`.`debrief` AS `debrief`,NULL AS `planning_designation`,NULL AS `asana_project_id`,`tt`.`desc` AS `desc` from ((`activity` `a` left join `task_type` `tt` on((`tt`.`id` = `a`.`type_id`))) join `activity_analyst` `aa` on((`a`.`id` = `aa`.`activity_id`))));

ALTER TABLE `insight_client`

ADD COLUMN `publish` TINYINT(1) NULL DEFAULT NULL AFTER `insight_id`,
ADD COLUMN `star` TINYINT(1) NULL DEFAULT NULL AFTER `publish`;

--7/9/2018
ALTER TABLE `client_ranking_report`
ADD COLUMN `client_type` INT NULL DEFAULT 0 AFTER `placement`;

--10/9/2018
CREATE TABLE `insight_firm` (
  `id` VARCHAR(36) NOT NULL,
  `insight_id` VARCHAR(45) NULL DEFAULT NULL,
  `firm_id` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 12/9/2018
ALTER TABLE `client_history`
ADD COLUMN `firm_id` VARCHAR(36) NULL DEFAULT NULL AFTER `collection_id`;
-- 13/09/2018
ALTER TABLE `groups`
ADD COLUMN `collection_id` VARCHAR(36) NULL DEFAULT NULL AFTER `report_id`;
INSERT INTO `object_templates` (`id`, `template_name`, `object`, `last_update`, `is_active`) VALUES ('00000000-0000-0000-0000-000000000011', 'Collection Detail', 'Collection ', '2018-06-29 09:17:38', 0);

-- 14/09/2018
CREATE TABLE `collection_item` (
  `id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `collection_id` VARCHAR(36) NOT NULL,
  `detail` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

ALTER TABLE `event`
ADD COLUMN `color` VARCHAR(45) NULL AFTER `location`;
ALTER TABLE `activity`
ADD COLUMN `color` VARCHAR(45) NULL AFTER `asana_id`;
ALTER TABLE `task`
ADD COLUMN `color` VARCHAR(45) NULL AFTER `asana_project_id`;
ALTER TABLE `client_activity`
ADD COLUMN `color` VARCHAR(45) NULL AFTER `is_active`;

-- 15/09/2018
CREATE TABLE `client_subcriber` (
  `id` NVARCHAR(36) NOT NULL,
  `client_id` NVARCHAR(36) NULL,
  `user_id` NVARCHAR(36) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `client_assigned` (
  `id` NVARCHAR(36) NOT NULL,
  `client_id` NVARCHAR(36) NULL,
  `user_id` NVARCHAR(36) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`));

-- 19/09/2018
CREATE TABLE `event_firm` (
  `id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NULL,
  `firm_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 24/09/2018
CREATE TABLE `outcome_activity` (
  `id` VARCHAR(36) NOT NULL,
  `outcome_id` VARCHAR(36) NULL,
  `activity_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `event`
CHANGE COLUMN `name` `name` TEXT NOT NULL ;
  CREATE TABLE `firm_client` (
  `client_id` VARCHAR(36) NOT NULL,
  `firm_id` VARCHAR(36) NOT NULL,
  `last_update` DATETIME NULL,
  PRIMARY KEY (`client_id`, `firm_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 25/09/2018
ALTER TABLE `client_research_category`
ADD COLUMN `last_update` DATETIME NULL AFTER `is_active`;

-- Last Updated Updates
ALTER TABLE activity
ADD COLUMN `last_updated` DATETIME NULL DEFAULT NULL AFTER `color`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL DEFAULT NULL AFTER `last_updated`;

Update activity
Set last_updated = NOW();

ALTER TABLE activity_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `is_active`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update activity_item
set last_updated = NOW();

ALTER TABLE analyst_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update analyst_item
set last_updated = NOW();

ALTER TABLE client_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update client_item
set last_updated = NOW();

ALTER TABLE collection_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update collection_item
set last_updated = NOW();

ALTER TABLE event_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update event_item
set last_updated = NOW();

---
ALTER TABLE firm_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update firm_item
set last_updated = NOW();

---
ALTER TABLE market_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update market_item
set last_updated = NOW();

---
ALTER TABLE report_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update report_item
set last_updated = NOW();

---
ALTER TABLE research_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `detail`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update research_item
set last_updated = NOW();

---
ALTER TABLE analyst_client_view_item
ADD COLUMN `last_updated` DATETIME NULL AFTER `updated_at`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update analyst_client_view_item
set last_updated = NOW();
--

ALTER TABLE client_objective
ADD COLUMN `last_updated` DATETIME NULL AFTER `create_at`,
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `last_updated`;

Update client_objective
set last_updated = NOW();

ALTER TABLE insight
ADD COLUMN `last_updated_by` VARCHAR(150) NULL AFTER `insight_status`;

-- 2.0.11

-- 02/10/2018
-- RUN add_index.sql file to set indexes
ALTER TABLE `activity`
ADD COLUMN `is_set_time` TINYINT(1) NULL DEFAULT 0 AFTER `last_updated_by`,
ADD COLUMN `time` VARCHAR(45) NULL DEFAULT NULL AFTER `is_set_time`;

-- 10/03/2018
INSERT INTO `global_setting` (`id`, `name`, `last_updated`, `action`) VALUES (uuid(), 'Placement', now(), 'placement');

CREATE TABLE `placement` (
  `id` VARCHAR(36) NOT NULL,
  `placement_name` VARCHAR(500) NULL,
  `firm_id` VARCHAR(36) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 10/08/2018
ALTER TABLE `ranking_report`
ADD COLUMN `placement` VARCHAR(36) NULL AFTER `client_type`;

-- 10/15/2018
ALTER TABLE `task`
CHANGE COLUMN `topic` `topic` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ;

-- 10/16/2018
ALTER TABLE `placement`
ADD COLUMN `is_active` BIT(1) NULL DEFAULT true AFTER `firm_id`;

-- 10/17/2018
ALTER TABLE `note`
ADD COLUMN `note_time` VARCHAR(45) NULL DEFAULT NULL ;

-- 10/18/2018
CREATE TABLE `user_activity_color` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(500) NULL,
  `activity_id` VARCHAR(36) NULL,
  `color` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

ALTER TABLE `client_activity`
DROP COLUMN `color`;

ALTER TABLE `event`
DROP COLUMN `color`;

-- 10/24/2018
ALTER TABLE `user`
ADD COLUMN `client_ids` TEXT NULL AFTER `full_name`,
ADD COLUMN `collection_ids` TEXT NULL AFTER `client_ids`;

-- 10/25/2018

ALTER TABLE `client_ranking_report`
ADD INDEX `idx_rrid_ia` (`ranking_report_id` ASC, `is_active` ASC);

ALTER TABLE `ranking_report_analyst`
ADD INDEX `idx_rrid_ia` (`ranking_report_id` ASC, `is_active` ASC);

ALTER TABLE `ranking_report_research`
ADD INDEX `idx_rri_ia` (`ranking_report_id` ASC, `is_active` ASC);

ALTER TABLE `research`
ADD INDEX `idx_id_isactive` (`id` ASC, `is_active` ASC);

ALTER TABLE `firm`
ADD INDEX `idx_fid_ia` (`id` ASC, `is_active` ASC);

ALTER TABLE `ranking_report`
ADD INDEX `idx_ia` (`is_active` ASC);

ALTER TABLE `analyst`
ADD INDEX `idx_aid_ia` (`id` ASC, `is_active` ASC);

ALTER TABLE `task`
CHANGE COLUMN `topic_ge` `topic_ge` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ,
CHANGE COLUMN `topic` `topic` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ;

ALTER TABLE `activity`
CHANGE COLUMN `topic_ge` `topic_ge` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ,
CHANGE COLUMN `topic` `topic` TEXT CHARACTER SET 'utf8' NULL DEFAULT NULL ;

ALTER TABLE `ranking_report`
CHANGE COLUMN `name` `name` VARCHAR(250) NOT NULL ;

-- 11/02/2018
ALTER TABLE `client_activity`
CHANGE COLUMN `date` `date` DATETIME NULL DEFAULT NULL ;

-- 11/09/2018
CREATE TABLE `insight_client_status` (
  `id` VARCHAR(36) NOT NULL,
  `client_id` VARCHAR(36) NULL DEFAULT NULL,
  `insight_id` VARCHAR(36) NULL DEFAULT NULL,
  `publish` TINYINT(1) NULL DEFAULT NULL,
  `star` TINYINT(1) NULL DEFAULT NULL,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- 11/23/2018
UPDATE `client_history` SET `client_executive_id` = NULL;
UPDATE `client_history` SET `client_partner_id` = NULL;

DROP TABLE IF EXISTS `client_executive`;
DROP TABLE IF EXISTS `client_partner`;

-- 12/04/2018
UPDATE `object_templates` SET `is_active` = 1 WHERE (`id` = '00000000-0000-0000-0000-000000000010');
UPDATE `object_templates` SET `is_active` = 1 WHERE (`id` = '00000000-0000-0000-0000-000000000011');

-- 12/16/2018
-- need to call API /api/activities/update-activity-name-data?limit=25000&offset=0 to get correct name of activity/outcome

-- 12/25/2018
--Add column client_id to support client level
ALTER TABLE `user_activity_color` 
ADD COLUMN `client_id` VARCHAR(36) NULL AFTER `color`;
-- delete the old data which is strict with user level
-- DELETE FROM user_activity_color;

