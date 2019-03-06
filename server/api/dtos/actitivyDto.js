'use strict';

export function ToOverviewActivityDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        analyst_id: item.analyst_id,
        id: item.id
      }
    );
  });
  return dto;
}

export function ToActivityListDto(data) {
  const dto = data.map(item => {
    var speakers = [];
    var analysts = [];
    var splitSpeakers =  item.all_speaker.split(", ");
    var splitAnalysts =  item.all_analyst.split(", ");
    var splitAnalystsIds =  item.all_analyst_id.split(", ");
    splitSpeakers.forEach(spe =>
      speakers.push({"name": spe})
    );
    for(var i= 0; i< splitAnalysts.length; i++)
    {
      analysts.push({"id": splitAnalystsIds[i], "name": splitAnalysts[i]});
    }
    return Object.assign(
      {},
      {
        id: item.id,
        due_date: item.due_date,
        client_name: item.client_name,
        speaker: speakers,
        topic: item.topic,
        sentiment: item.sentiment,
        type: item.type == null ? "": item.type,
        analysts: analysts
      }
    );
  });
  return dto;
}

export function TaskActivity(data)
{
  if(data.length == 0)
    return {};

  var item = data[0];

  var taskType = {};
  taskType.id= item.task_type_id;
  taskType.desc= item.task_type_desc;
  taskType.is_active= item.task_type_active;

  var analysts = [];
  var analyst = {};
  analyst.id = item.analyst_id;
  analyst.name = item.analyst_name;
  analyst.is_active = item.analyst_active;
  analyst.ActivityAnalyst = {analyst_id: item.analyst_id, activity_id: item.id};
  analysts.push(analyst);

  var client = {};
  client.id= item.client_id;
  client.name = item.client_name;
  client.origination_date = item.client_orig_date;
  client.is_active = item.client_active;

  return Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      TaskType: taskType,
      Analysts: analysts,
      Client: client,
      Events: [],
      Speakers: [],
      Categories: [],
      Reports: [],
      source: "task"
    }
  );
}

export function TaskActivityAnalyst(data)
{
  if(data.length == 0)
    return [];

  var item = data[0];
  console.log("item " + JSON.stringify(data));
  var taskType = {};
  if(item.InteractionTypes && item.InteractionTypes.length > 0)
  {
    var it = item.InteractionTypes[0];
    if(it && it.TaskType)
    {
      taskType = it.TaskType;
    }
  }

  var analysts = [];
  if(item.Analyst)
  {
    var analyst = {analyst_id: item.analyst_id, activity_id: item.id, Analyst: item.Analyst};
    analysts.push(analyst);
  }


  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      TaskType: taskType,
      ActivityAnalysts: analysts,
    }
  );
  console.log("ret Object " + JSON.stringify(data));
  return retObj;
}

export function TaskActivityClient(data)
{
  if(data.length == 0)
    return [];

  var item = data[0];

  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      Client: item.Client
    }
  );
  return retObj;
}

export function TaskActivityCategory(data)
{
  if(data.length == 0)
    return [];

  var item = data[0];
  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      ActivityCategories: [],
    }
  );
  return retObj;
}

export function TaskActivityEvent(data)
{
  if(data.length == 0)
    return [];

  var item = data[0];
  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      ActivityEvents: [],
    }
  );
  return retObj;
}

export function TaskActivityReport(data)
{

  if(data.length == 0)
    return [];

  var item = data[0];
  console.log("item " + JSON.stringify(item));
  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      ActivityReports: [],
    }
  );
  console.log("retObj " + JSON.stringify(retObj));
  return retObj;
}

export function TaskActivitySpeaker(data)
{
  if(data.length == 0)
    return [];

  var item = data[0];
  var retObj =  Object.assign(
    {},
    {
      id: item.id,
      client_id: item.client_id,
      name: item.task_name,
      type_id: item.task_type_id,
      start_date: null,
      due_date: item.date,
      quarter: item.quarter,
      speakers: item.speakers,
      sentiment: item.sentiment,
      topic: item.topic,
      topic_ge: item.topic_ge,
      description: item.description,
      debrief: item.debrief,
      asana_id: item.asana_id,
      ActivitySpeakers: [],
    }
  );
  return retObj;
}

export function ListActivityForClient(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.id,
        type: item.TaskType ? item.TaskType.desc : '',
        type_kind: item.TaskType ? item.TaskType.kind : '',
        topic: item.topic,
        Analysts: item.Analysts.map(analyst => { return Object.assign({}, { id: analyst.id, name: analyst.name, Firm: {id: analyst.AnalystHistory[0].Firm.id, name: analyst.AnalystHistory[0].Firm.name } }) }),
        Speakers: item.Speakers.map(speaker => { return Object.assign({}, { name: speaker.name }) }),
        date: item.due_date,
        start_date: item.start_date,
        due_date: item.due_date,
        sentiment: item.sentiment,
        clientName: item.Client ? item.Client.name : '',
        clientId: item.Client? item.Client.id: '',
        note_types: item.note_types ? item.note_types: '',
        note_status: item.note_status ? item.note_status: '',
        has_debrief: item.debrief ? item.debrief != '<p></p>' ? true : false : false,
        time: item.time,
        is_set_time: item.is_set_time
      }
    );
  });
  return dto;
}

export function ListNoteForActivity(data) {
  let array = [];
  const dto = data.map(item => {
    item.Notes.map(note => {
      let temp = Object.assign(
        {},
        {
          TaskType: note.TaskType,
          activity_id: note.activity_id,
          activity_type: note.activity_type,
          analyst_id: note.analyst_id,
          description: note.description,
          end_date: note.end_date,
          id: note.id,
          note_status: note.note_status,
          note_type: note.note_type,
          start_date: note.start_date,
          update_at: note.update_at,
          client: item.Client,
          activity_date: item.start_date
        })
      array.push(temp);
    })
  })
  return array;
}
