export function ListNote(data) {
  const dto = data.map(item => {
    console.log(JSON.stringify(item));
    return Object.assign(
      {},
      {
        TaskType: item.Activity ?  item.Activity.TaskType : (item.Task ? item.Task.InteractionTypes.TaskType : ''),
        activity_id: item.activity_id,
        activity_type: item.activity_type,
        analyst_id: item.analyst_id,
        description: item.description,
        end_date: item.end_date,
        id: item.id,
        note_status: item.note_status,
        note_type: item.note_type,
        start_date: item.start_date,
        update_at: item.update_at,
        client: item.Activity ?  item.Activity.Client : (item.Task ? item.Task.Client : {}),
        client_id: item.Activity ?  item.Activity.client_id : (item.Task ? item.Task.client_id : undefined),
        activity_date: item.Activity ?  item.Activity.start_date : (item.Task ? item.Task.date : undefined)
      })
  });
  return dto;
}
