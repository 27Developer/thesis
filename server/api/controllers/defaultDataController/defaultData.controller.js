'use strict';
import _ from 'lodash';
import * as responseHelper from '../../../components/helper/response-helper';
import awsCognitoService from '../../../components/aws-cognito/aws-cognito-register';
import {
  Cohort,
  SegmentationType,
  ClientType,
  ChurnReason,
  Effort,
  AnalystFirmSubscriptionType,
  Firm,
  FirmResearch,
  ResearchType,
  VendorLeaning,
  Research,
  InteractionType,
  TaskType,
  InteractionDesignationType,
  Client,
  Role,
  ClientHistory,
  Country,
  State,
  User,
  Region,
  TableConfig,
  ChangeLog,
  Media,
  Groups,
  Items,
  ActivityLog,
  PublishLink,
  sequelize,
  UserToken 
} from '../../../sqldb';
import { ListInteractionTypeDto } from '../../dtos/interactionTypeDto';
import { ListFirmInfoDto } from '../../dtos/firmDto';

var request = require('request');
import config from '../../../config/environment';
var CommonService = require('../../services/common.service')
var jwt_decode = require('jwt-decode');

// Gets all of Cohort
export function GetAllCohort(req, res) {
  return Cohort.findAll({ where: { is_active: true }, order: [['name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of SegmentationType
export function GetAllSegmentationType(req, res) {
  return SegmentationType.findAll({ where: { is_active: true }, order: [['desc', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of ClientType
export function GetAllClientType(req, res) {
  return ClientType.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of ChurnReason
export function GetAllChurnReason(req, res) {
  return ChurnReason.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of Effort
export function GetAllEffort(req, res) {
  return Effort.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of AnalystFirmSubscriptionType
export function GetAllAnalystFirmSubscriptionType(req, res) {
  return AnalystFirmSubscriptionType.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

////FIRM
// Gets categories for Firm
export function GetCategoryFirm(req, res) {
  const firmId = req.query.firmId;
  return FirmResearch.findAll({
    where: {
      firm_id: firmId
    }
  })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
// Gets all of Firm
export function GetAllFirm(req, res) {
  var queryStr = `SELECT 
                  firm.*, c.numofanalyst, h.numOfClient
                FROM
                  firm
                      LEFT JOIN
                  (SELECT 
                      firm_Id, COUNT(firm_Id) AS numofanalyst
                  FROM
                      analyst_history AS b
                  INNER JOIN analyst AS d ON b.analyst_id = d.id
                      AND d.is_active = TRUE
                  WHERE
                      is_active_record = TRUE
                  GROUP BY firm_Id) AS c ON firm.id = c.firm_Id
                      LEFT JOIN
                  (SELECT 
                    firm_Id, COUNT(firm_Id) AS numOfClient
                FROM
                    firm_client AS d
                INNER JOIN client AS e ON d.client_id = e.id
                    AND e.is_active = TRUE
                GROUP BY firm_Id) AS h ON firm.id = h.firm_Id
                WHERE
                  firm.is_active = TRUE`;
  sequelize.query(queryStr, {
    type: sequelize.QueryTypes.SELECT
  })
    .then(function (data) {
      if (data.length > 0) {
        return ListFirmInfoDto(data);
      }
    })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
// Check Firm
export function CheckFirm(req, res) {
  return Firm.find({
    where: {
      id: req.query.id == undefined ? {
        $ne: null
      } : {
          $ne: req.query.id
        },
      is_active: true,
      name: req.query.name
    }
  })
    .then(responseHelper.checkIfAvailable(res))
    .catch(responseHelper.handleError(res));
}
//group api
var executeUpdateGroup = function (group, firm_id, template_id) {
  return new Promise(async (resolve, reject) => {
    let checkUpdateGroupItem = group.firm_id != null;
    let checGroupkAddEdit = group.id != null;
    group.visibility = group.visibility != '0';
    const promis = await new Promise(async (resolve, reject) => {
      if (checGroupkAddEdit) {
        resolve(group.id);
        await Groups.update(group, { where: { id: group.id, firm_id: group.firm_id } });
      } else {
        group.template_id = template_id;
        group.firm_id = firm_id;
        await Groups.max('index', {
          where: { template_id, is_active: true }
        });
        var group_new = await Groups.create(group);
        resolve(group_new.id);
      }
    }).then(id => {
      if (checGroupkAddEdit && !checkUpdateGroupItem) {
        return;
      }
      var arrayPromise = [];
      var group_id = id;
      for (let i = 0; i < group.Items.length; i++) {
        let item = group.Items[i];
        item.is_active = item.is_active != '0';
        item.item_type = item.item_type != '0';
        item.group_id = group_id;
        item.last_update = new Date();

        if (item.id) {
          arrayPromise.push(Items.update(item, { where: { id: item.id } }));
        } else {
          arrayPromise.push(Items.create(item));
        }
      }

      return Promise.all(arrayPromise).then(res => {
        resolve(res);
      })
        .catch(err => {
          reject(err);
        });
    });
  });
};
// Creates a new Firm in the DB
export function AddFirm(req, res) {
  req.body.firmData.Firm.is_active = true;
  return sequelize.transaction(async function (t) {
    var data = req.body.firmData;
    var groups = data.group;
    var newFirm = {};
    var newMedia = {};
    var listFunction = [];

    if (Object.keys(data.image).length > 0) {
      newMedia = await Media.create(data.image, {
        transaction: t
      })
      data.Firm.media_id = newMedia.media_id;
    }

    newFirm = await Firm.create(data.Firm, {
      transaction: t
    });

    //Add FirmResearch
    _.forEach(data.Categories, function (category) {
      sequelize.transaction(async function (t) {
        FirmResearch.create({
          firm_id: newFirm.id,
          research_id: category.id
        }, {
            transaction: t
          });
      });
    });

    groups.forEach(group => {
      listFunction.push(executeUpdateGroup(group, newFirm.id, data.templateID));
    });
    Promise.all(listFunction);

    return newFirm;
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}
// Upsert the given Firm in the DB at the specified ID
export function UpdateFirm(req, res) {
  return sequelize.transaction(async function (t) {
    var data = req.body.firmData;
    var groups = data.group;
    var listFunction = [];
    await FirmResearch.destroy({
      where: {
        firm_id: req.body.firmData.Firm.id
      },
      transaction: t
    });

    if ((data.Firm.media_id === '' || data.Firm.media_id === null) && Object.keys(data.image).length > 0) {
      let newMeida = await Media.create(data.image, { transaction: t });
      data.Firm.media_id = newMeida.media_id;
    }
    else if (data.Firm.media_id !== '' && Object.keys(data.image).length > 0) {
      data.image.media_id = data.Firm.media_id;
      await Media.update(data.image, { where: { media_id: data.Firm.media_id }, transaction: t })
    }

    // update firm
    await Firm.update({
      name: req.body.firmData.Firm.name,
      media_id: data.Firm.media_id,
    },
      {
        where: {
          id: req.body.firmData.Firm.id
        },
        transaction: t
      });
    //Add FirmResearch
    _.forEach(req.body.firmData.Categories, function (category) {
      sequelize.transaction(async function (t) {
        await FirmResearch.create({
          firm_id: req.body.firmData.Firm.id,
          research_id: category.id
        }, {
            transaction: t
          });
      });
    });
    groups.forEach(group => {
      listFunction.push(executeUpdateGroup(group, data.Firm.id, data.templateID));
    });
    Promise.all(listFunction);
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}
// Delete the given Firm in the DB at the specified ID
export function DeleteFirm(req, res) {
  return sequelize.transaction(function (t) {
    let tasks = [];
    let listFirmId = [];
    let listData = [];
    listFirmId = req.query.listFirmId;
    if (Array.isArray(listFirmId)) {
      listData = listFirmId;
    } else {
      let arraytemp = [];
      arraytemp.push(listFirmId);
      listData = arraytemp;
    }

    _.forEach(listData, function (firmId) {
      tasks.push(
        Firm.update({
          is_active: false
        }, {
            where: {
              id: firmId
            },
            transaction: t
          })
      );
    });

    return Promise.all(tasks);
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}


// Gets all of ResearchType
export function GetAllResearchType(req, res) {
  return ResearchType.findAll(
    {

      where: { is_active: true }
    }
  )
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of VendorLeaning
export function GetAllVendorLeaning(req, res) {
  return VendorLeaning.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

//Research
export function GetAllResearch(req, res) {
  return Research.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function CheckResearch(req, res) {
  return Research.find({
    where: {
      id: req.query.id == undefined ? { $ne: null } : { $ne: req.query.id },
      is_active: true,
      desc: req.query.desc
    }
  })
    .then(responseHelper.checkIfAvailable(res))
    .catch(responseHelper.handleError(res));
}
export function AddResearch(req, res) {
  var research = req.body.researchData;
  research.is_active = true;
  return sequelize.transaction(function (t) {
    return Research.create(research, { transaction: t });
  })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
export function UpdateResearch(req, res) {
  return sequelize.transaction(function (t) {
    return Research.upsert(req.body.researchData, { transaction: t });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}
export function DeleteResearch(req, res) {
  return sequelize.transaction(function (t) {
    return Research.update(
      {
        is_active: false
      },
      {
        where: {
          id: req.query.id
        },

        transaction: t
      });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}


////Interaction Types
// Gets all of Interaction Types
export function GetAllInteractionType(req, res) {
  return InteractionType.findAll({
    include: [TaskType, InteractionDesignationType],
    where: { is_active: true }
  })
    .then(function (data) {
      if (data.length > 0) {
        return ListInteractionTypeDto(data);
      }
    })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
// Gets Interaction Type by Id
function GetInteractionTypeById(id) {
  return InteractionType.findAll({
    include: [TaskType, InteractionDesignationType],
    where: {
      id,
      is_active: true
    }
  })
    .then(function (data) {
      if (data.length > 0) {
        return ListInteractionTypeDto(data);
      }
    })
    .catch(function (err) {
      res.send(err);
    });
}
// Check Interaction Type
export function CheckInteractionType(req, res) {
  return InteractionType.find({
    where: {
      id: req.query.id == undefined ? { $ne: null } : { $ne: req.query.id },
      is_active: true,
      asana_tags: req.query.asana_tags
    }
  })
    .then(responseHelper.checkIfAvailable(res))
    .catch(responseHelper.handleError(res));
}
// Creates a new Interaction Type in the DB
export function AddInteractionType(req, res) {
  var data = req.body.interactionTypeData;
  var interactionType = data.InteractionType;

  //Prepare data
  interactionType.task_type_id = data.TaskType == null ? null : data.TaskType.id;
  interactionType.interaction_designation_type_id = data.TaskDesignation == null ? null : data.TaskDesignation.id;

  return sequelize.transaction(function (t) {
    return InteractionType.create(interactionType, { transaction: t });
  })
    .then(it => {
      return GetInteractionTypeById(it.id);
    })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
// Upsert the given InteractionType in the DB at the specified ID
export function UpdateInteractionType(req, res) {
  var data = req.body.interactionTypeData;
  var interactionType = data.InteractionType;

  //Prepare data
  interactionType.task_type_id = data.TaskType == null ? null : data.TaskType.id;
  interactionType.interaction_designation_type_id = data.TaskDesignation == null ? null : data.TaskDesignation.id;

  return sequelize.transaction(function (t) {
    return InteractionType.upsert(interactionType, { transaction: t });
  })
    .then(() => {
      return GetInteractionTypeById(interactionType.id);
    })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}
// Delete the given Interaction Type in the DB at the specified ID
export function DeleteInteractionType(req, res) {
  return sequelize.transaction(function (t) {
    return InteractionType.update(
      {
        is_active: false
      },
      {
        where: {
          id: req.query.id
        },

        transaction: t
      });
  })
    .then(() => {
      res.send();
    })
    .catch(responseHelper.handleError(res));
}


// Gets all of Task Type
export function GetAllTaskType(req, res) {
  return TaskType.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

// Gets all of Task Designations
export function GetAllTaskDesignation(req, res) {
  return InteractionDesignationType.findAll({ where: { is_active: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function GetAllClient(req, res) {
  return Client.findAll({ where: { is_active: true }, order: [['name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAllRole(req, res) {
  return Role.findAll({ where: { is_active: true }, order: [['role_name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function GetAllTopicGe(req, res) {
  var headers = {
    Authorization: `Bearer ${config.asanaAccessToken}`,
    Accept: 'application/json'
  };

  var options = {
    url: `${config.asanaUrlApi}/custom_fields/${config.asanaCustomFieldTopicGe}`,
    method: 'GET',
    headers,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return res.status(200).json(body);
    }
  });
}

export function getClientHistoryByClientId(req, res) {
  return ClientHistory.findAll({ where: { client_id: req.query.id, is_active_record: true } })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getAllCountries(req, res) {
  return Country.findAll({ order: [['country_name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getStatesByCountryCode(req, res) {
  return State.findAll({ where: { country_code: req.query.code }, order: [['state_name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function getTimeUserLogin(req, res) {

  let bearerToken;
  let bearerHeader = req.headers['authorization'];
  let bearer = bearerHeader.split(' ');
  bearerToken = bearer[1];

  return UserToken.findAll({ where: { access_token: bearerToken } })
    .then(resObj => {
      let data = resObj[0].dataValues;
      let decoded = jwt_decode(data.token_id);

      return CommonService.updateUserRecord(decoded);
    }).then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateFirstLogin(req, res) {
  var email = req.body.email;
  return sequelize.transaction(function (t) {
    User.update({ first_login: true }, { where: { email } }, { transaction: t })
      .then(() => {
        res.send();
      })
      .catch(responseHelper.handleError(res));
  });
}

export function getRegions(req, res) {
  return Region.findAll({ order: [['region_name', 'ASC']] })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function updateTableConfig(req, res) {
  var data = req.body.data;
  return TableConfig.findOne({ where: { table_name: data.table_name, email: data.email } })
    .then(response => {
      if (!response) {
        return sequelize.transaction(function (t) {
          return TableConfig.create(data, { transaction: t });
        })
          .then(() => {
            res.send();
          })
          .catch(responseHelper.handleError(res));
      } else {
        return sequelize.transaction(function (t) {
          return TableConfig.update(
            {
              column_name: data.column_name
            },
            {
              where: {
                table_name: data.table_name,
                email: data.email
              },

              transaction: t
            });
        })
          .then(() => {
            res.send();
          })
          .catch(responseHelper.handleError(res));
      }
    })
    .catch(responseHelper.handleError(res));
}

export function getTableConfig(req, res) {
  let data = JSON.parse(req.query.data);
  return TableConfig.findOne({ where: { table_name: data.table_name, email: data.email } })
    .then((data) => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

// export function getClientAnalystCount(req, res) {
//   var query = `SELECT
//   analystResearch.id,
//   analystResearch.desc,
//   analystResearch.analystTotal,
//   clientResearch.clientTotal
// FROM
//   (SELECT
//       a.id, a.desc, COUNT(b.id) AS analystTotal
//   FROM
//       research AS a
//   LEFT JOIN analyst_research_categories AS b ON a.id = b.research_id
//       AND b.is_active = TRUE
//   WHERE
//       a.is_active = TRUE
//   GROUP BY a.id) AS analystResearch
//       LEFT JOIN
//   (SELECT
//       c.id, c.desc, COUNT(d.id) AS clientTotal
//   FROM
//       research AS c
//   LEFT JOIN client_research_category AS d ON c.id = d.research_id
//       AND d.is_active = TRUE
//   WHERE
//       c.is_active = TRUE
//   GROUP BY c.id) AS clientResearch ON analystResearch.id = clientResearch.id;`;
//   try {
//     return sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
//       .then(data => {
//         res.send(data);
//       })
//       .catch(err => {
//         throw err;
//       })
//   } catch (error) {
//     console.log(error);
//   }
// }

export function getChangeLog(req, res) {
  let data = JSON.parse(req.query.data);
  return ChangeLog.findAll({
    where: {
      page: {
        $eq: data.page
      },
      $or: [
        {
          object_id: {
            $eq: data.objectId
          }
        },
        {
          object_id: {
            $eq: null
          }
        },
        {
          object_id: {
            $eq: ''
          }
        }
      ]
    }, order: [['date', 'DESC']]
  })
    .then((data) => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function getActivityLog(req, res) {
  let data = JSON.parse(req.query.data);
  return ActivityLog.findAll({
    where: {
      page: {
        $eq: data.page
      },
      object_id: {
        $eq: data.objectId
      }
    }, order: [['update_date', 'DESC'], ['log_type', 'DESC']]
  })
    .then((data) => {
      res.send(data);
    })
    .catch(responseHelper.handleError(res));
}

export function migrateDataAws(req, res) {
  return sequelize.transaction(async function (t) {
    let data = await awsCognitoService.getListUser();
    if (!data.statusCode) {
      for (let i = 0; i < data.Users.length; i++) {
        let item = data.Users[i];
        let obj = {};
        for (let j = 0; j < item.Attributes.length; j++) {
          let temp = item.Attributes[j];
          switch (temp.Name) {
            case 'email':
              obj.email = temp.Value;
              break;
            case 'given_name':
              obj.firstName = temp.Value;
              break;
            case 'name':
              obj.lastName = temp.Value;
              break;
          }
        }
        await User.update({ full_name: obj.firstName + ' ' + obj.lastName }, { where: { email: obj.email } }, { transaction: t });
      }
    }
  })
    .then(data => {
      console.log(true);
      res.send(true);
    })
    .catch(err => {
      console.log(err);
    });
}

export function createPublishLink(req, res) {
  let dataModel = req.body.data;
  let temp = new Date();
  dataModel.create_date = new Date();
  dataModel.exprire = temp.setDate(temp.getDate() + 14);
  return sequelize.transaction(function (t) {
    return PublishLink.create(dataModel, { transaction: t });
  })
    .then(responseHelper.respondWithResult(res))
    .catch(responseHelper.handleError(res));
}

export function searchGlobal(req, res) {
  var keyword = req.query.keyword;
  CommonService.searchGlobal(keyword).then(data => {
    res.send(data);
  })
    .catch(responseHelper.handleError(res));
}
