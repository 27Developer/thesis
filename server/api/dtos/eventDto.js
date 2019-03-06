export function ListEventForClient(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.id,
        name: item.name,
        location: item.location,
        start_date: item.start_date,
        end_date: item.end_date,
        color: item.color,
        Analysts: item.Analysts.map(analyst => { return Object.assign({}, { id: analyst.id, name: analyst.name }) }),
        Clients: item.Clients.map(client => { return Object.assign({}, { id: client.id, name: client.name }) }),
        Researchs: item.Researchs.map(research => { return Object.assign({}, { id: research.id, name: research.desc }) })
      })
  });
  return dto;
}


export function ListNoteForEvent(data) {
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
