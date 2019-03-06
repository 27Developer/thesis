'use strict';

export function TaskDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        analyst_id: item.analyst_id,
        analyst_name: item.Analyst == null ? null : item.Analyst.name,
        asana_id: item.asana_id,
        asana_name: item.id,
        client_id: item.id,
        client_name: item.Client == null ? null : item.Client.name,
        comments: item.id,
        core_status: item.core_status,
        date: item.date,
        debrief: item.debrief,
        description: item.description,
        firm_id: item.firm_id,
        id: item.id,
        primary_objective: item.primary_objective,
        quarter: item.quarter,
        secondaryObjective: item.secondaryObjective,
        sentiment: item.sentiment,
        speakers: item.speakers,
        subtask_names: item.subtask_names,
        task_name: item.task_name,
        topic: item.topic,
        topic_ge: item.topic_ge,
        desc_type: item.desc,
        planning_designation: item.planning_designation,
        analystName: item.analystName,
        firmName: item.firmName,
        taskType: item.InteractionTypes == null ? null : item.InteractionTypes[0]
      }
    );
  });
  return dto;
}
