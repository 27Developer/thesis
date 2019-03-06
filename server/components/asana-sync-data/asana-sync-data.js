'use strict';

import asana from 'asana';
import config from '../../config/environment';
import uuid from 'uuid';
import emailSender from '../email-sender/email-sender';
import interactionTypeUpdate from './interaction-type-update';
import log4Js from 'log4js';
log4Js.configure({
  appenders: [
    {type: 'file', filename: 'logs/etlProcess.log', category: 'etlProcess'}
  ]
});

var logger = log4Js.getLogger('etlProcess');

import {Task, Client, InteractionType, Analyst, AnalystHistory, Tag, TaskTag} from '../../sqldb';

var workspaceId = config.asanaWorkspaceId;
var projects = [];
var projectIndex = 0;
var tasks = [];
var errors = [];
var clients = [];
var interactionTypes = [];
var analysts = [];
var analystHistories = [];
var inquiryInteractionTypeTasks = [];
var socket = [];
var lastNotification = '';
var isRunning = false;
var asanaSyncData = [];
var tagList = [];
var asanaTags = [];

asanaSyncData.process = async function (socketSource) {
  try {
    logger.info('Start ETL process.');
    isRunning = true;
    socket = socketSource;
    projects = [];
    projectIndex = 0;
    tasks = [];
    errors = [];
    clients = [];
    interactionTypes = [];
    analysts = [];
    analystHistories = [];
    inquiryInteractionTypeTasks = [];
    tagList = [];
    asanaTags = [];

    logger.info('Get Tag from database.');
    tagList = await Tag.findAll({
      attributes: ['id', 'description', 'is_active']
    }).catch(handleException);

    logger.info('Get Client from database.');
    clients = await Client.findAll({
      attributes: ['id', 'name']
    }).catch(handleException);

    logger.info('Get Analyst from database.');
    analysts = await Analyst.findAll({
      attributes: ['id', 'name']
    }).catch(handleException);

    logger.info('Get AnalystHistory from database.');
    analystHistories = await AnalystHistory.findAll({
      attributes: ['id', 'analyst_id']
    }).catch(handleException);

    logger.info('Get InteractionType from database.');
    interactionTypes = await InteractionType.findAll({
      attributes: ['id', 'asana_tags']
    }).catch(handleException);

    const asanaClient = asana.Client.create().useAccessToken(config.asanaAccessToken);

    logger.info('Delete all previous Task from database.');
    await Task.destroy({
      where: {
        id: {
          $ne: ''
        }
      }
    }).catch(handleException);

    logger.info('Start get tags.');
    getTags(undefined, asanaClient, tagsComplete);
  } catch (err) {
    handleException(err);
  }
};

asanaSyncData.getLastNotification = function () {
  return lastNotification;
};

asanaSyncData.isProcessRunning = function () {
  return isRunning;
};

export default asanaSyncData;

var getTags = function (prevResponse, asanaClient, tagsComplete) {
  try {
    if (!prevResponse) {
      asanaClient.tags
        .findByWorkspace(workspaceId, {
          limit: 100,
          opt_fields: 'id, name'
        })
        .then(function (response) {
          handleTagResponse(asanaClient, response, tagsComplete);
        })
        .catch(handleException);
    } else {
      prevResponse.nextPage()
        .then(function (response) {
          handleTagResponse(asanaClient, response, tagsComplete);
        })
        .catch(handleException);
    }
  } catch (err) {
    throw err;
  }
};

var handleTagResponse = function (asanaClient, response, tagsComplete) {
  try {
    asanaTags = asanaTags.concat(response.data);
    if (response._response.next_page) {
      getTags(response, asanaClient, tagsComplete);
    } else {
      logger.info('Get Tags completed.');
      tagsComplete();
    }
  } catch (err) {
    throw err;
  }
};

var tagsComplete = async function () {
  try {
    const asanaClient = asana.Client.create().useAccessToken(config.asanaAccessToken);

    asanaTags = asanaTags.filter(filterNewAsanaTags, tagList);

    logger.info('Save new Asana tags to database.');
    await saveNewAsanaTagsToDatabase();

    getProjects(undefined, asanaClient, projectsComplete);
  } catch (err) {
    throw err;
  }
};

var saveNewAsanaTagsToDatabase = async function () {
  for (let i = 0; i < asanaTags.length; i++) {
    const newTag = {
      id: uuid.v1(),
      description: asanaTags[i].name,
      is_active: true,
      asana_id: asanaTags[i].id
    };

    tagList = tagList.concat(newTag);

    await Tag
      .create(newTag)
      .catch(handleException);
  }
};

var filterNewAsanaTags = function (tag) {
  const existedTags = this;
  const existedTagsFilterResult = existedTags.filter(filterTagByTagDecription, tag.name);
  return existedTagsFilterResult.length === 0;
};

var filterTagByTagDecription = function (tag) {
  const tagName = correctHyphenOfString(correctWhiteSpaceOfString(this.normalize('NFKD'))).trim();
  if (correctHyphenOfString(correctWhiteSpaceOfString(tag.description.normalize('NFKD'))).trim() === tagName) {
    return true;
  }
  return false;
};

var getProjects = function (prevResponse, asanaClient, projectsComplete) {
  try {
    if (!prevResponse) {
      asanaClient.projects
        .findByWorkspace(workspaceId, {limit: 100})
        .then(function (response) {
          handleProjectResponse(asanaClient, response, projectsComplete);
        })
        .catch(handleException);
    } else {
      prevResponse.nextPage()
        .then(function (response) {
          handleProjectResponse(asanaClient, response, projectsComplete);
        })
        .catch(handleException);
    }
  } catch (err) {
    throw err;
  }
};

var handleProjectResponse = function (asanaClient, response, projectsComplete) {
  try {
    projects = projects.concat(response.data);
    if (response._response.next_page) {
      getProjects(response, asanaClient, projectsComplete);
    } else {
      projectsComplete();
    }
  } catch (err) {
    throw err;
  }
};

var projectsComplete = function () {
  try {
    logger.info(`Start get tasks for project: ${projects[0].name}.<br/>`);
    const asanaClient = asana.Client.create().useAccessToken(config.asanaAccessToken);
    getTasksForProject(projects[0].id, undefined, asanaClient, getProjectTasksComplete);
  } catch (err) {
    throw err;
  }
};

var getTasksForProject = function (projectId, prevResponse, asanaClient, getProjectTasksComplete) {
  try {
    if (!prevResponse) {
      asanaClient.tasks
        .findByProject(projectId, {
          limit: 100,
          opt_fields: 'id, due_on, name, custom_fields, custom_fields.id, custom_fields.name, custom_fields.type, custom_fields.enum_value, custom_fields.text_value, projects, projects.name, tags, tags.name, notes, subtasks, subtasks.name, subtasks.due_on, subtasks.completed, stories, stories.type, stories.text, stories.created_by.name, stories.created_at'
        })
        .then(function (response) {
          handleTasksResponse(projectId, response, asanaClient, getProjectTasksComplete);
        })
        .catch(handleException);
    } else {
      prevResponse.nextPage()
        .then(function (response) {
          handleTasksResponse(projectId, response, asanaClient, getProjectTasksComplete);
        })
        .catch(handleException);
    }
  } catch (err) {
    throw err;
  }
};

var handleTasksResponse = async function (projectId, response, asanaClient, getProjectTasksComplete) {
  try {
    tasks = tasks.concat(response.data);
    while (tasks.length > 0) {
      await processTask(tasks[0], projectId);
      deleteFirstTask();
    }
    if (response._response.next_page) {
      getTasksForProject(projectId, response, asanaClient, getProjectTasksComplete);
    } else {
      getProjectTasksComplete(asanaClient);
    }
  } catch (err) {
    throw err;
  }
};

var deleteFirstTask = function () {
  try {
    tasks.splice(0, 1);
  } catch (err) {
    throw err;
  }
};

var getProjectTasksComplete = function (asanaClient) {
  try {
    projectIndex++;
    logger.info(`Project Completed: ${projectIndex}.<br/>`);
    if (projects.length > 1) {
      deleteFirstProject();
      logger.info(`Process Project: ${projects[0].name} | ${projects[0].id}.<br/>`);
      getTasksForProject(projects[0].id, undefined, asanaClient, getProjectTasksComplete);
    } else {
      deleteFirstProject();
      tasksComplete();
    }
  } catch (err) {
    throw err;
  }
};

var deleteFirstProject = function () {
  try {
    projects.splice(0, 1);
  } catch (err) {
    throw err;
  }
};

var tasksComplete = async function () {
  try {
    await interactionTypeUpdate.process();
    await sendErrorReportToUser();
  } catch (err) {
    throw err;
  }
};

var processTask = async function (taskI, projectId) {
  try {
    if (isRunning) {
      taskI.isDelete = false;
      taskI = await correctTaskData(taskI, projectId);
      taskI = await deleteRecordsNoTags(taskI);
      taskI = await errorValidationBeforeTransform(taskI, projectId);
      taskI = await transformTask(taskI);
      taskI = await errorValidationAfterTransform(taskI, projectId);
      await getTaskData(taskI);
    }
  } catch (err) {
    throw err;
  }
};

var correctTaskData = async function (taskI, projectId) {
  try {
    const projectList = taskI.projects;
    if (projectList.length !== 1) {
      const projectsTemp = projectList.filter(checkProjectId, projectId);
      taskI.projects = projectsTemp;
    }
    taskI.clientName = taskI.projects[0].name;
    taskI.asanaName = taskI.projects[0].name;
    taskI.asanaProjectId = taskI.projects[0].id;

    const interactionType = getInteractionTypeByTask(taskI);
    taskI.interactionType = interactionType;

    const interactionTypeId = getInteractionTypeIdByTask(taskI);
    taskI.interactionTypeId = interactionTypeId;

    return taskI;
  } catch (err) {
    throw err;
  }
};

var checkProjectId = function (project) {
  try {
    return correctHyphenOfString(correctWhiteSpaceOfString(this.toString().trim().normalize('NFKD'))) === correctHyphenOfString(correctWhiteSpaceOfString(project.id.toString().trim().normalize('NFKD')));
  } catch (err) {
    throw err;
  }
};

var deleteRecordsNoTags = async function (taskI) {
  try {
    if (typeof (taskI.tags) === 'undefined' || taskI.tags === null || taskI.tags.length === 0) {
      taskI.isDelete = true;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var getTaskData = async function (taskI) {
  try {
    if (isRunning) {
      if (!taskI.isDelete) {
        const taskDate = new Date(taskI.due_on);
        const taskName = taskI.name;
        const customFields = await getCustomFieldsByTask(taskI);
        const analystId = await getAnalystId(taskI);
        const taskId = uuid.v1();
        const clientId = await getClientIdByProjectName(taskI.clientName);
        const taskQuarter = Math.ceil(((taskDate).getMonth() + 1) / 3);
        const taskSubtasks = await getSubTaskNamesByTask(taskI);
        const taskComments = await getCommentsByTask(taskI);
        const taskTopic = getValueOfCustomField(customFields['Topic_GE']);
        const coreStatus = getValueOfCustomField(customFields['Core vs. Non-core']);
        const firmId = await getFirmIdByTaskAnalystId(analystId);
        const taskSpeakers = getValueOfCustomField(customFields['Speakers']);
        const taskSentiment = getValueOfCustomField(customFields['Sentiment']);
        const taskPrimaryObjective = getValueOfCustomField(customFields['Primary Objective']);
        const taskSecondaryObjective = getValueOfCustomField(customFields['Secondary Object']);
        const debrief = getValueOfCustomField(customFields['Debrief']);
        const topic = getValueOfCustomField(customFields['Topic']);
        const planningDesignation = await getPlanningDesignation(taskI.clientName);
        const asanaProjectId = taskI.asanaProjectId;

        const taskData = {
          id: taskId,
          asana_id: taskI.id,
          client_id: clientId,
          analyst_id: analystId,
          task_name: taskName,
          date: taskDate,
          quarter: taskQuarter,
          description: taskI.notes,
          subtask_names: taskSubtasks,
          comments: taskComments,
          topic_ge: taskTopic,
          core_status: coreStatus,
          firm_id: firmId,
          speakers: taskSpeakers,
          sentiment: taskSentiment,
          primary_objective: taskPrimaryObjective,
          secondaryObjective: taskSecondaryObjective,
          topic: topic,
          asana_name: taskI.asanaName,
          debrief: debrief,
          planning_designation: planningDesignation,
          asana_project_id: asanaProjectId
        };
        await Task
          .create(taskData)
          .catch(handleException);

        for (let j = 0; j < taskI.tags.length; j++) {
          const tag = tagList.filter(filterTagByTagDecription, taskI.tags[j].name);

          await TaskTag
            .create({id: uuid.v1(), task_id: taskId, tag_id: tag[0].id})
            .catch(handleException);
        }
      }
    }
  } catch (err) {
    throw err;
  }
};

var getValueOfCustomField = function (customField) {
  try {
    if (customField === undefined || typeof (customField) === 'string') {
      return customField;
    } else if (typeof (customField) === 'object' && customField !== null) {
      return customField.name;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var getClientIdByProjectName = function (projectName) {
  try {
    var name = correctWhiteSpaceOfString(projectName.normalize('NFKD')).trim().split(': Planning');
    for (let i = 0; i < clients.length; i++) {
      if (correctHyphenOfString(correctWhiteSpaceOfString(clients[i].name.trim().normalize('NFKD'))) === correctHyphenOfString(correctWhiteSpaceOfString(projectName.trim().normalize('NFKD'))) || (correctHyphenOfString(correctWhiteSpaceOfString(clients[i].name.trim().normalize('NFKD'))) === correctHyphenOfString(correctWhiteSpaceOfString(name[0].trim().normalize('NFKD'))) && name.length > 1 )) {
        return clients[i].id;
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var getPlanningDesignation = function (projectName) {
  try {
    var name = correctWhiteSpaceOfString(projectName.normalize('NFKD')).trim().split(': Planning');
    for (let i = 0; i < clients.length; i++) {
      if (correctHyphenOfString(correctWhiteSpaceOfString(clients[i].name.trim().normalize('NFKD'))) === correctHyphenOfString(correctWhiteSpaceOfString(name[0].trim().normalize('NFKD'))) && name.length > 1) {
        return 'P';
      } else if (correctHyphenOfString(correctWhiteSpaceOfString(clients[i].name.trim().normalize('NFKD'))) === correctHyphenOfString(correctWhiteSpaceOfString(projectName.trim().normalize('NFKD')))) {
        return 'C';
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var getInteractionTypeByTask = function (taskI) {
  try {
    let tasktags = taskI.tags;
    tasktags = tasktags.filter(filterActiveTags, tagList);
    if (tasktags.length > 0) {
      let tagString = tasktags[0].name;
      for (let i = 1; i < tasktags.length; i++) {
        tagString = tagString.concat(', ', tasktags[i].name);
      }
      return tagString;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var getInteractionTypeIdByTask = function (taskI) {
  try {
    const interactionType = correctHyphenOfString(correctWhiteSpaceOfString(taskI.interactionType));
    if (interactionType === null) {
      return null;
    }
    for (let j = 0; j < interactionTypes.length; j++) {
      if (correctHyphenOfString(correctWhiteSpaceOfString(interactionTypes[j].asana_tags)) === interactionType) {
        return interactionTypes[j].id;
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var filterActiveTags = function (tag) {
  const tagsList = this;
  const filterActiveTagWithNameResult = tagsList.filter(filterActiveTagWithName, tag.name);
  return filterActiveTagWithNameResult.length > 0;
};

var filterActiveTagWithName = function (tag) {
  const tagName = correctHyphenOfString(correctWhiteSpaceOfString(this.normalize('NFKD'))).trim();
  if (correctHyphenOfString(correctWhiteSpaceOfString(tag.description.normalize('NFKD'))).trim() === tagName && tag.is_active) {
    return true;
  }
  return false;
};

var getAnalystNameListByTaskName = function (taskName) {
  try {
    const components = splitTaskNameToComponents(taskName);
    if (components.length > 1) {
      return components[0].trim();
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var correctWhiteSpaceOfString = function (source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source.replace(/\u00a0/g, ' ');
  } catch (err) {
    throw err;
  }
};

var correctHyphenOfString = function (source) {
  try {
    if (source === null || source === undefined) {
      return null;
    }
    return source
      .replace(/\u1806/g, '-')
      .replace(/\u2010/g, '-')
      .replace(/\u2011/g, '-')
      .replace(/\u2012/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '-')
      .replace(/\u2015/g, '-')
      .replace(/\u207b/g, '-')
      .replace(/\u208b/g, '-')
      .replace(/\u2122/g, '-')
      .replace(/\ufe58/g, '-')
      .replace(/\ufe63/g, '-')
      .replace(/\uff0d/g, '-')
      .replace(/–/g, '-');
  } catch (err) {
    throw err;
  }
};

var splitTaskNameToComponents = function (taskName) {
  try {
    taskName = correctHyphenOfString(taskName);
    taskName = correctWhiteSpaceOfString(taskName);
    const components = taskName.split(' - ');
    return components;
  } catch (err) {
    throw err;
  }
};

var getAnalystId = function (taskI) {
  try {
    const analyst = analysts.filter(checkAnalystName, taskI.analystName);
    if (analyst.length !== 0) {
      const analystId = analyst[0].id;
      return analystId;
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var checkAnalystName = function (analyst) {
  try {
    const name = correctWhiteSpaceOfString(this);
    analyst.dataValues.name = correctWhiteSpaceOfString(analyst.dataValues.name);
    return name === analyst.dataValues.name;
  } catch (err) {
    throw err;
  }
};

var getSubTaskNamesByTask = function (taskI) {
  try {
    const lines = [];
    let line = '';
    for (let st = 0; st > taskI.subtasks.length; st++) {
      const completed = taskI.subtasks[st].completed ? 'C' : 'I';
      let dueOn = '-';
      if (taskI.subtasks[st].due_on) {
        dueOn = formatDate(taskI.subtasks[st].due_on);
      }
      lines.push(taskI.subtasks[st].name + ' (' + dueOn + ') (' + completed + ')');
    }
    if (lines.length > 0) {
      line = '| ' + lines.join(' // ') + ' |';
    }
    return line;
  } catch (err) {
    throw err;
  }
};

var getCommentsByTask = function (taskI) {
  try {
    const lines = [];
    let line = '';
    for (let s = 0; s < taskI.stories.length; s++) {
      const story = taskI.stories[s];
      if (story.type !== 'comment') {
        continue;
      }
      const initials = getInitials(story.created_by.name);
      const createdAt = formatDate(story.created_at);
      lines.push(story.text + ' (' + createdAt + ') (' + initials + ')');
    }
    if (lines.length > 0) {
      line = '| ' + lines.join(' // ') + ' |';
    }
    return line;
  } catch (err) {
    throw err;
  }
};

var getCustomFieldsByTask = function (taskI) {
  try {
    const customFields = {};
    for (let cf = 0; cf < taskI.custom_fields.length; cf++) {
      const custom = taskI.custom_fields[cf];
      if (custom.type === 'text') {
        customFields[custom.name] = custom.text_value;
      } else {
        customFields[custom.name] = custom.enum_value;
      }
    }
    return customFields;
  } catch (err) {
    throw err;
  }
};

var getFirmIdByTaskAnalystId = function (analystId) {
  try {
    for (let i = 0; i < analystHistories.length; i++) {
      if (analystHistories[i].analyst_id === analystId) {
        return analystHistories[i].firm_id;
      }
    }
    return null;
  } catch (err) {
    throw err;
  }
};

var formatDate = function (date) {
  try {
    const dateObj = new Date(date);
    return dateObj.toString('dd.MM.yyyy');
  } catch (err) {
    throw err;
  }
};

var getInitials = function (name) {
  try {
    let initials = '';
    const parts = name.split(' ');
    for (let i = 0; i < parts.length; i++) {
      initials += parts[i].toUpperCase();
    }
    return initials;
  } catch (err) {
    throw err;
  }
};

var errorValidationBeforeTransform = async function (taskI, projectId) {
  try {
    taskI = validateErrorNullDateHasComment(taskI, projectId);
    taskI = valivateIncorrectTaskNameSyntax(taskI, projectId);
    return taskI;
  } catch (err) {
    throw err;
  }
};

var errorValidationAfterTransform = async function (taskI, projectId) {
  try {
    if (!taskI.isDelete) {
      taskI = validateAnalystNameMismatch(taskI, projectId);
      taskI = validateInteractionTypeMismatch(taskI, projectId);
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var validateErrorNullDateHasComment = function (taskI, projectId) {
  try {
    if (!taskI.isDelete) {
      const comments = getCommentsByTask(taskI);
      if (comments === null || comments === '' || comments === undefined || comments.length === 0) {
        return taskI;
      } else if (taskI.due_on === null || taskI.due_on === '' || typeof (taskI.due_on) === 'undefined') {
        taskI = addErrorNullDateHasComments(taskI, projectId);
        logger.info(`validateErrorNullDateHasComment: Task Name: ${taskI.name} | due_on: ${taskI.due_on}`);
        return taskI;
      } else {
        const taskDate = new Date(taskI.due_on);
        if (taskDate.getDate() === 'NaN' || taskDate.getMonth() === 'NaN' || taskDate.getFullYear() === 'NaN') {
          taskI = addErrorNullDateHasComments(taskI, projectId);
          logger.info(`validateErrorNullDateHasComment: Task Name: ${taskI.name} | Task Date: ${taskDate}`);
          return taskI;
        }
      }
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var addErrorNullDateHasComments = function (taskI, projectId) {
  try {
    if (taskI.interactionTypeId !== null && taskI.interactionTypeId !== '') {
      let error = `${config.errorNullDateHasComments}"${taskI.name}"<br />`;
      error = '<br><br>' + error + ' URL: https://app.asana.com/0/' + projectId + '/' + taskI.id + ' \n'
      addErrorToReport(error);
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var valivateIncorrectTaskNameSyntax = function (taskI, projectId) {
  try {
    if (!taskI.isDelete) {
      const components = splitTaskNameToComponents(taskI.name);
      if (components.length < 2) {
        if (taskI.interactionTypeId !== null && taskI.interactionTypeId !== '') {
          let error = `${config.errorIncorrectSyntaxTaskNameField}"${taskI.name}"<br />`
          error = '<br><br>' +  error + ' URL: https://app.asana.com/0/' + projectId + '/' + taskI.id + ' \n'
          addErrorToReport(error);
        }
        logger.info(`valivateIncorrectTaskNameSyntax: Task Name: ${taskI.name} | components.length: ${components.length}`);
      }
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var validateAnalystNameMismatch = function (taskI, projectId) {
  try {
    if (!taskI.isDelete && taskI.analystName !== null) {
      const analystId = getAnalystId(taskI);
      if (analystId === null) {
        let error = `${config.errorAnalystNameMismatch}<br />`;
        error = error.replace('AnalystName', taskI.analystName);
        error = error.replace('TaskName', taskI.name);
        if (taskI.interactionTypeId !== null && taskI.interactionTypeId !== '') {
          error = '<br><br>' + error + ' URL: https://app.asana.com/0/' + projectId + '/' + taskI.id + ' \n'
          addErrorToReport(error);
        }
        logger.info(`validateAnalystNameMismatch: Task Name: ${taskI.name} Analyst Name: ${taskI.analystName}`);
      }
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var validateInteractionTypeMismatch = function (taskI, projectId) {
  try {
    if (!taskI.isDelete && taskI.interactionType !== null) {
      const interactionId = taskI.interactionTypeId;
      if (interactionId === null) {
        let error = `${config.errorInteractionTypeMismatch}<br />`;
        error = error.replace('InteractionType', taskI.interactionType);
        logger.info(`validateInteractionTypeMismatch: Task Name: ${taskI.name} | Interaction Type: ${taskI.interactionType}`);
        if (taskI.interactionTypeId !== null && taskI.interactionTypeId !== '') {
          error = '<br><br>' + error + ' URL: https://app.asana.com/0/' + projectId + '/' + taskI.id + ' \n'
          addErrorToReport(error);
        }
      }
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var transformTask = async function (taskI) {
  try {
    if (!taskI.isDelete) {
      taskI = await deleteRecordsNullDates(taskI);
      // taskI = await deleteRecordsGreaterThanToday(taskI);
      taskI = await deleteRecordsEqualAnalystOpportunity(taskI);
      taskI = await correctClientNameInteractionTypeInquiry(taskI);
      taskI = await deleteDuplicateInteractionTypes(taskI);
      taskI = await multipleAnalystNames(taskI);
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var deleteRecordsNullDates = async function (taskI) {
  try {
    if (!taskI.isDelete) {
      if (taskI.due_on === null || taskI.due_on === '' || typeof (taskI.due_on) === 'undefined') {
        taskI.isDelete = true;
        logger.info(`deleteRecordsNullDates: Task Name: ${taskI.name} | due_on: ${taskI.due_on}`);
        return taskI;
      } else {
        const taskDate = new Date(taskI.due_on);
        if (taskDate.getDate() === 'NaN' || taskDate.getMonth() === 'NaN' || taskDate.getFullYear() === 'NaN') {
          taskI.isDelete = true;
          logger.info(`deleteRecordsNullDates: Task Name: ${taskI.name} | Task Date: ${taskDate}`);
          return taskI;
        }
      }
      return taskI;
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

/*var deleteRecordsGreaterThanToday = async function (taskI) {
 try {
 if (!taskI.isDelete) {
 const taskDate = new Date(taskI.due_on);
 const today = new Date();
 if (taskDate !== today && taskDate > today) {
 taskI.isDelete = true;
 logger.info(`deleteRecordsGreaterThanToday: Task Name: ${taskI.name} | Task Date: ${taskDate}`);
 return taskI;
 }
 }
 return taskI;
 } catch (err) {
 throw err;
 }
 };*/

var deleteRecordsEqualAnalystOpportunity = async function (taskI) {
  try {
    if (!taskI.isDelete) {
      const interactionType = correctHyphenOfString(correctWhiteSpaceOfString(taskI.interactionType));
      if (interactionType !== undefined && interactionType !== null && (interactionType.includes('Analyst Opportunity'))) {
        logger.info(`deleteRecordsEqualAnalystOpportunity: Task Name: ${taskI.name} |  Interaction Type: ${interactionType}`);
        if (correctHyphenOfString(correctWhiteSpaceOfString(taskI.clientName)) !== 'Opportunities') {
          taskI.isDelete = true;
        }
        return taskI;
      }
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var correctClientNameInteractionTypeInquiry = async function (taskI) {
  try {
    if (!taskI.isDelete) {
      const interactionType = taskI.interactionType;
      if (interactionType === 'Inquiry') {
        taskI.clientName = 'AD';
        logger.info(`correctClientNameInteractionTypeInquiry: Task Name: ${taskI.name} |  Interaction Type: ${interactionType} | Client Name: ${taskI.clientName}`);
        return taskI;
      }
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var deleteDuplicateInteractionTypes = async function (taskI) {
  try {
    if (!taskI.isDelete) {
      const interactionType = taskI.interactionType;
      if (interactionType === 'Inquiry') {
        const taskNameI = correctHyphenOfString(correctWhiteSpaceOfString(taskI.name.normalize('NFKD'))).trim();
        const dateI = new Date(taskI.due_on);
        const descriptionI = correctHyphenOfString(correctWhiteSpaceOfString(taskI.notes.normalize('NFKD'))).trim();
        const task = {
          taskName: taskNameI,
          date: dateI.toLocaleDateString('en-US'),
          description: descriptionI
        };
        const existedTaskInquiryInteractionType = inquiryInteractionTypeTasks.filter(checkInquiryInteractionType, task);
        if (existedTaskInquiryInteractionType.length === 0) {
          inquiryInteractionTypeTasks.push(task);
        } else {
          taskI.isDelete = true;
          logger.info(`deleteDuplicateInteractionTypes: Task Name: ${taskI.name}`);
        }
      }
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var checkInquiryInteractionType = function (task) {
  try {
    const taskExisted = this;
    return (task.taskName.localeCompare(taskExisted.taskName) === 0 &&
    task.date.localeCompare(taskExisted.date) === 0 &&
    task.description.localeCompare(taskExisted.description) === 0);
  } catch (err) {
    throw err;
  }
};

var multipleAnalystNames = async function (taskI) {
  try {
    if (!taskI.isDelete && typeof (taskI.analystName) === 'undefined') {
      const analystNameList = getAnalystNameListByTaskName(taskI.name);
      if (analystNameList === null || analystNameList === undefined) {
        taskI.analystName = null;
        return taskI;
      }
      const analystNames = analystNameList.split(', ');
      taskI.analystName = analystNames[0].trim();
      for (let i = 1; i < analystNames.length; i++) {
        const taskNew = Object.assign({}, taskI);
        taskNew.analystName = analystNames[i].trim();
        tasks.push(taskNew);
      }
    }
    return taskI;
  } catch (err) {
    throw err;
  }
};

var addErrorToReport = function (error) {
  try {
    errors = errors.concat(error);
    return;
  } catch (err) {
    throw err;
  }
};

var uniqueErrors = function () {
  try {
    if (errors.length <= 0) {
      errors.push(config.noErrorMessage);
    }
    errors.sort();
    let index = 0;
    let currentError;
    let nextError;
    while (index < errors.length - 1) {
      currentError = correctWhiteSpaceOfString(errors[index]);
      currentError = correctHyphenOfString(currentError);
      currentError = currentError.normalize('NFKD');

      nextError = correctWhiteSpaceOfString(errors[index + 1]);
      nextError = correctHyphenOfString(nextError);
      nextError = nextError.normalize('NFKD');

      if (currentError.localeCompare(nextError) === 0) {
        errors.splice(index + 1, 1);
      } else {
        index++;
      }
    }
  } catch (err) {
    throw err;
  }
};

var sendEmailToUsers = function () {
  try {
    let errorReport = '';
    for (let p = 0; p < errors.length; p++) {
      errorReport = errorReport.concat(errors[p]);
    }
    const userEmails = config.userEmailList;
    for (let i = 0; i < userEmails.length; i++) {
      emailSender.sendEmail(config.emailServiceAccount,
        userEmails[i],
        'Error report of ETL process.',
        errorReport,
        errorReport);
    }
  } catch (err) {
    throw err;
  }
};

var emitNotificationToClients = function () {
  try {
    const date = new Date();
    lastNotification = {
      isSuccess: true,
      date: date,
      errorCount: errors.length,
      errorMessage: null
    };
    socket.emit('etl_process_stoped', true);
    socket.emit('etl_process_notify_message', lastNotification);
    socket.broadcast.emit('etl_process_stoped', true);
    socket.broadcast.emit('etl_process_notify_message', lastNotification);
    logger.info('ETL process completed.<br/>');
  } catch (err) {
    throw err;
  }
};

var sendErrorReportToUser = function () {
  try {
    uniqueErrors();

    sendEmailToUsers();

    emitNotificationToClients();

    isRunning = false;
    return;
  } catch (err) {
    throw err;
  }
};

var handleException = function (err) {
  logger.error(`${err}.`);
  if (err.toString().startsWith('SequelizeDatabaseError')) {
    err = 'Unable to connect to database';
  } else if (err.toString().startsWith('Error: No Authorization')) {
    err = 'Unable to connect to Asana due to token expired';
  } else if (err.toString().startsWith('Error: Server Error')) {
    err = 'Unable to connect to Asana due to Asana server error';
  } else {
    err = 'Unspecified error occurred. Please check the logs for more detail';
  }
  const date = new Date();
  lastNotification = {
    isSuccess: false,
    date: date,
    errorCount: errors.length,
    errorMessage: err
  };
  socket.emit('etl_process_stoped', true);
  socket.emit('etl_process_notify_message', lastNotification);
  socket.broadcast.emit('etl_process_stoped', true);
  socket.broadcast.emit('etl_process_notify_message', lastNotification);
  isRunning = false;
};
