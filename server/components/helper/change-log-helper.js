'use strict';
import {
  ChangeLog,
  ActivityLog,
  sequelize
} from '../../sqldb';
import _ from 'lodash';
import config from '../../config/environment/shared';
var diff = require('deep-diff');

export function createChangeLog(data) {
  try {
    data.date = new Date();
    return sequelize.transaction(async function(t) {
      ChangeLog.create(data, { transaction: t });
    })
      .then((data) => {
        console.log(data);
      });
  } catch (err) {
    console.log(err);
  }
}

export function createActivityLog(listModelChange) {
  try {
    listModelChange.forEach((item) => {
      item.update_date = new Date();
    });

    return sequelize.transaction(async function(t) {
      ActivityLog.bulkCreate(listModelChange, { transaction: t });
    })
      .then((data) => {
        console.log(data);
      });
  } catch (err) {
    console.log(err);
  }
}

let matchRefColumn = function(refColumns, path) {
  for (let i = 0; i < refColumns.length; i++) {
    let pathRef = refColumns[i];
    if (_.difference(path, pathRef).length == 0) {
      return i;
    }
  }
  return -1;
};

let handleRefCategories = function(ObjectSaveLog, categoriesNew, categoriesOld) {

  let newCategoryIds = [];
  let oldCategoryIds = [];
  let listModelChange = [];

  newCategoryIds = categoriesNew.map(item => item.id);
  oldCategoryIds = categoriesOld.map(item => item.id);

  let removedCategoryIds = _.difference(oldCategoryIds, newCategoryIds);
  let addedCategoryIds = _.difference(newCategoryIds, oldCategoryIds);

  let addedCategories = categoriesNew.filter(function(item) {
    return addedCategoryIds.indexOf(item.id) > -1;
  });

  let removedCategories = categoriesOld.filter(function(item) {
    return removedCategoryIds.indexOf(item.id) > -1;
  });

  addedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.CATEGORIES;
    modelTemp.parent_object_model = item.desc;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Added Category ${item.desc}`;
    modelTemp.new_value = item.desc;
    modelTemp.log_type = config.logType.REF_ADD;
    listModelChange.push(modelTemp);
  });

  removedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.CATEGORIES;
    modelTemp.parent_object_model = item.desc;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Removed Category ${item.desc}`;
    modelTemp.new_value = item.desc;
    modelTemp.log_type = config.logType.REF_DELETE;
    listModelChange.push(modelTemp);
  });
  return listModelChange;
}

let handleRefAssigned = function(ObjectSaveLog, assignedNew, assignedOld) {

  let newAssignedIds = [];
  let oldAssignedIds = [];
  let listModelChange = [];
  newAssignedIds = assignedNew.map(item => item.id);
  oldAssignedIds = assignedOld.map(item => item.id);
  let removedAssignedIds = _.difference(oldAssignedIds, newAssignedIds);
  let addedAssignedIds = _.difference(newAssignedIds, oldAssignedIds);

  let addedCategories = assignedNew.filter(function(item) {
    return addedAssignedIds.indexOf(item.id) > -1;
  });

  let removedCategories = assignedOld.filter(function(item) {
    return removedAssignedIds.indexOf(item.id) > -1;
  });

  addedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.ASSIGNED;
    modelTemp.parent_object_model = item.full_name;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Added Assigned ${item.full_name}`;
    modelTemp.new_value = item.full_name;
    modelTemp.log_type = config.logType.REF_ADD;
    listModelChange.push(modelTemp);
  });

  removedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.ASSIGNED;
    modelTemp.parent_object_model = item.full_name;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Removed Assigned ${item.full_name}`;
    modelTemp.new_value = item.full_name;
    modelTemp.log_type = config.logType.REF_DELETE;
    listModelChange.push(modelTemp);
  });
  return listModelChange;
}

let handleRefFirm = function(ObjectSaveLog, assignedNew, assignedOld) {

  let newAssignedIds = [];
  let oldAssignedIds = [];
  let listModelChange = [];
  newAssignedIds = assignedNew.map(item => item.id);
  oldAssignedIds = assignedOld.map(item => item.id);
  let removedAssignedIds = _.difference(oldAssignedIds, newAssignedIds);
  let addedAssignedIds = _.difference(newAssignedIds, oldAssignedIds);

  let addedCategories = assignedNew.filter(function(item) {
    return addedAssignedIds.indexOf(item.id) > -1;
  });

  let removedCategories = assignedOld.filter(function(item) {
    return removedAssignedIds.indexOf(item.id) > -1;
  });

  addedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.FIRM;
    modelTemp.parent_object_model = item.name;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Added Research Firm Subscription ${item.name}`;
    modelTemp.new_value = item.name;
    modelTemp.log_type = config.logType.REF_ADD;
    listModelChange.push(modelTemp);
  });

  removedCategories.forEach((item) => {
    let modelTemp = {};
    modelTemp.user = ObjectSaveLog.user;
    modelTemp.page = ObjectSaveLog.templatePage;
    modelTemp.section = config.section.FIRM;
    modelTemp.parent_object_model = item.name;
    modelTemp.parent_object_id = item.id;
    modelTemp.object_id = ObjectSaveLog.id;
    modelTemp.object_model = ObjectSaveLog.name;
    modelTemp.data_model = `Removed Research Firm Subscription ${item.name}`;
    modelTemp.new_value = item.name;
    modelTemp.log_type = config.logType.REF_DELETE;
    listModelChange.push(modelTemp);
  });
  return listModelChange;
}

export function getChangeLog(refColumns, refColumnNames, newObject, oldObject, objectSaveLog) {
  let listModelChange = []
  listModelChange = handleRefCategories(objectSaveLog, newObject.Research, oldObject.Research);
  delete newObject.Research;
  delete oldObject.Research;

  if ((newObject.Assigned && newObject.Assigned.length > 0) || (oldObject.Assigned && oldObject.Assigned.length)) {
    listModelChange = _.concat(listModelChange, handleRefAssigned(objectSaveLog, newObject.Assigned, oldObject.Assigneds));
    delete newObject.Assigned;
    delete oldObject.Assigned;
  }

  if ((newObject.Client && newObject.Client.AnalystFirmSubscription && newObject.Client.AnalystFirmSubscription.length > 0) || (oldObject.Client && oldObject.Client.AnalystFirmSubscription && oldObject.Client.AnalystFirmSubscription.length)) {
    listModelChange = _.concat(listModelChange, handleRefFirm(objectSaveLog, newObject.Client.AnalystFirmSubscription, oldObject.Client.AnalystFirmSubscription));
    delete newObject.Client.AnalystFirmSubscription;
    delete oldObject.Client.AnalystFirmSubscription;
  }

  var differences = diff(oldObject, newObject);
  if (differences) {
    differences.forEach((item) => {
      let modelTemp = {};
      if (item.kind == 'E' && item.rhs) {
        let number = matchRefColumn(refColumns, item.path)
        if (number > -1) {
          modelTemp.user = objectSaveLog.user;
          modelTemp.page = objectSaveLog.templatePage;
          modelTemp.section = objectSaveLog.section;
          modelTemp.old_value = item.lhs;
          modelTemp.new_value = item.rhs;
          modelTemp.object_id = objectSaveLog.id;
          modelTemp.object_model = objectSaveLog.name;
          modelTemp.data_model = `Updated ${refColumnNames[number]} to ${item.rhs}`;
          modelTemp.log_type = config.logType.UPDATE;
          listModelChange.push(modelTemp);
        }
      }
    });
  }
  return listModelChange;
}
