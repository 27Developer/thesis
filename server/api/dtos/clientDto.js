'use strict';
export function ResearchCategoriesDto(categories)
{
  var retCats = {};
  categories.forEach(function(cat)
  {
    if(!retCats[cat.client_id])
      retCats[cat.client_id] = [];
      var temp = JSON.parse(JSON.stringify(cat));
      delete temp.Research;
    retCats[cat.client_id].push(
      {
        id: cat.Research.id,
        desc: cat.Research.desc,
        is_active: cat.Research.is_active,
        ClientResearchCategoriesId: cat.id,
        dataMapping : temp
      }
    );
  });
  return retCats;
}

export function AssignedsDto(assigneds)
{
  var retAssigneds = {};
  assigneds.forEach(function (assig)
  {
    if (!retAssigneds[assig.client_id]) {
      retAssigneds[assig.client_id] = [];
    }

    var temp = JSON.parse(JSON.stringify(assig));
    delete temp.User;
    var user = assig.User || [];
    user.ClientAssigned = temp;
    retAssigneds[assig.client_id].push(user);
  });
  return retAssigneds;
}

export function ListClientDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        ClientHistory: {
          id: item.id,
          monthly_recurring_revenue: item.monthly_recurring_revenue,
          analyst_plan: item.analyst_plan,
          churn_date: item.churn_date,
          executive_sponser: item.executive_sponser,
          poc_nps: item.poc_nps,
          buyer_nps: item.buyer_nps,
          overall_nps: item.overall_nps,
          team_email: item.team_email,
          address: item.address,
          city: item.city,
          country: item.country,
          state: item.state,
          influence: item.influence,
          phone: item.phone,
          zipCode: item.zip_code,
          websiteUrl: item.website_url,
          profileDescription: item.profile_description,
          client_speakers: item.client_speakers,
          client_assigned: item.client_assigned,
        },
        Cohort: item.Cohort == null
          ? null
          : {
            id: item.Cohort.id,
            name: item.Cohort.name,
            is_active: item.Cohort.is_active
          },
        Collection: item.Collection == null
          ? null
          : {
            id: item.Collection.id,
            name: item.Collection.name,
          },
        Segmentation: item.SegmentationType == null
          ? null
          : {
            id: item.SegmentationType.id,
            desc: item.SegmentationType.desc,
            is_active: item.SegmentationType.is_active
          },
        ClientType: item.ClientType == null
          ? null
          : {
            id: item.ClientType.id,
            desc: item.ClientType.desc,
            is_active: item.ClientType.is_active
          },
        ChurnReason: item.ChurnReason == null
          ? null
          : {
            id: item.ChurnReason.id,
            desc: item.ChurnReason.desc,
            is_active: item.ChurnReason.is_active
          },
        Effort: item.Effort == null
          ? null
          : {
            code: item.Effort.code,
            desc: item.Effort.desc,
            is_active: item.Effort.is_active
          },
        Research: item.Client.Research == null
          ? null
          : item.Client.Research.map(a => {
            return Object.assign(
              {},
              {
                id: a.id,
                desc: a.desc,
                is_active: a.is_active,
                ClientResearchCategoriesId: a.ClientResearchCategories.dataValues.id,
                dataMapping : a.ClientResearchCategories
              }
            );
          }),
        Client: { 
          id: item.Client.id,
          is_active: item.Client.is_active,
          name: item.Client.name,
          origination_date: item.Client.origination_date,
          image_url: item.Client.image_url,
          AnalystFirmSubscription: item.Client.FirmClients == null
            ? []
            : item.Client.FirmClients.map(fc => {
              return Object.assign(
                {},
                {
                  id: fc.Firm ? fc.Firm.id : null,
                  name: fc.Firm ? fc.Firm.name : ''
                }
              );
            }),
          ClientHealthHistories: !item.Client.ClientHealthHistories ? null : item.Client.ClientHealthHistories.length === 0 ? null
            : item.Client.ClientHealthHistories.map(ch => {
              return Object.assign(
                {},
                {
                  totalClientHealthScore: ch.sentiment + ch.mechanics + ch.message + ch.outcome + ch.activation,
                  program_health: ch.program_health,
                  date: ch.date
                }
              );
            }),
          ClientHealthHistoriesRecent: item.Client.ClientHealthHistoriesRecent == null
            ? null
            : item.Client.ClientHealthHistoriesRecent.map(ch => {
              return Object.assign(
                {},
                {
                  totalClientHealthScore: ch.sentiment + ch.mechanics + ch.message + ch.outcome + ch.activation,
                  program_health: ch.program_health,
                  date: ch.date
                }
              );
            }),
          analyst_plan: item.analyst_plan // Array.from(new Set(item.Client.SubSegmentAnalyst.map(x=>{return x.analyst_id}))).length
        },
        Assigneds: item.Client.Assigneds
      }
    );
  });
  return dto;
}

export function ListClientDtoAdv(data, categories, assigneds) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        ClientHistory: {
          id: item.id,
          monthly_recurring_revenue: item.monthly_recurring_revenue,
          analyst_plan: item.analyst_plan,
          churn_date: item.churn_date,
          executive_sponser: item.executive_sponser,
          poc_nps: item.poc_nps,
          buyer_nps: item.buyer_nps,
          overall_nps: item.overall_nps,
          team_email: item.team_email,
          address: item.address,
          city: item.city,
          country: item.country,
          state: item.state,
          influence: item.influence,
          phone: item.phone,
          zipCode: item.zip_code,
          websiteUrl: item.website_url,
          profileDescription: item.profile_description,
          client_speakers: item.client_speakers,
          client_assigned: item.client_assigned,
        },
        Cohort: item.Cohort == null
          ? null
          : {
            id: item.Cohort.id,
            name: item.Cohort.name,
            is_active: item.Cohort.is_active
          },
        Collection: item.Collection == null
          ? null
          : {
            id: item.Collection.id,
            name: item.Collection.name,
          },
        Segmentation: item.SegmentationType == null
          ? null
          : {
            id: item.SegmentationType.id,
            desc: item.SegmentationType.desc,
            is_active: item.SegmentationType.is_active
          },
        ClientType: item.ClientType == null
          ? null
          : {
            id: item.ClientType.id,
            desc: item.ClientType.desc,
            is_active: item.ClientType.is_active
          },
        ChurnReason: item.ChurnReason == null
          ? null
          : {
            id: item.ChurnReason.id,
            desc: item.ChurnReason.desc,
            is_active: item.ChurnReason.is_active
          },
        Effort: item.Effort == null
          ? null
          : {
            code: item.Effort.code,
            desc: item.Effort.desc,
            is_active: item.Effort.is_active
          },
        Client: { 
          id: item.Client.id,
          is_active: item.Client.is_active,
          name: item.Client.name,
          origination_date: item.Client.origination_date,
          image_url: item.Client.image_url,
          AnalystFirmSubscription: item.Client.FirmClients == null
            ? []
            : item.Client.FirmClients.map(fc => {
              return Object.assign(
                {},
                {
                  id: fc.Firm ? fc.Firm.id : null,
                  name: fc.Firm ? fc.Firm.name : ''
                }
              );
            }),
          ClientHealthHistories: !item.Client.ClientHealthHistories ? null : item.Client.ClientHealthHistories.length === 0 ? null
            : item.Client.ClientHealthHistories.map(ch => {
              return Object.assign(
                {},
                {
                  totalClientHealthScore: ch.sentiment + ch.mechanics + ch.message + ch.outcome + ch.activation,
                  program_health: ch.program_health,
                  date: ch.date
                }
              );
            }),
          ClientHealthHistoriesRecent: item.Client.ClientHealthHistoriesRecent == null
            ? null
            : item.Client.ClientHealthHistoriesRecent.map(ch => {
              return Object.assign(
                {},
                {
                  totalClientHealthScore: ch.sentiment + ch.mechanics + ch.message + ch.outcome + ch.activation,
                  program_health: ch.program_health,
                  date: ch.date
                }
              );
            }),
          analyst_plan: item.analyst_plan // Array.from(new Set(item.Client.SubSegmentAnalyst.map(x=>{return x.analyst_id}))).length
        },
        Assigneds: assigneds[item.Client.id] ? assigneds[item.Client.id] : [],
        Research: categories[item.Client.id] ? categories[item.Client.id] : []
      }
    );
  });
  return dto;
}


export function ListAnalystAssocialClientDto(data) {
  let avgSentiment = function (sentiment) {
    let filterSentiment = [];
    sentiment.forEach(x => {
      if (x.InsightClient.length === 0) {
        return;
      }
      else filterSentiment.push(x);
    });
    if (filterSentiment.length === 0) {
      return 0
    }
    if (filterSentiment.length === 1) {
      return filterSentiment[0].sentiment;
    }
    let limitSentiment = filterSentiment.slice(0, 10);
    return Number((limitSentiment.map(x => { return Number(x.sentiment) }).reduce((a, b) => { return (a + b) }) / limitSentiment.length).toFixed(1));
  }
  let array = [];
  data.map(item => {
    item.SubSegmentAnalyst.map(itemSegment => {
      let temp = Object.assign(
        {},
        {
          id: item.id,
          name: item.name,
          activities: item.Activities.length ? {
            Analysts: item.Activities[0].Analysts,
            type: item.Activities[0].TaskType.desc,
            start_date: item.Activities[0].start_date,
            due_date: item.Activities[0].due_date
          } : '',
          activity_time: item.Activities.length ? item.Activities[0].due_date : '',
          firmAndTitle: item.AnalystHistory[0],
          client: itemSegment.Client,
          segment: {
            id: itemSegment.SubSegment.Segment.id,
            name: itemSegment.SubSegment.Segment.name
          },
          subSegment: {
            id: itemSegment.SubSegment.id,
            name: itemSegment.SubSegment.name
          },
          sentiment: item.Insights.length === 0 ? 0 : avgSentiment(item.Insights)
        })
      array.push(temp);
    })
  });
  return array;
}


export function ListAnalystAssocialCollectionDto(data) {
  let array = [];
  data.map(item => {
    item.SubSegmentAnalyst.map(itemSegment => {
      let temp = Object.assign(
        {},
        {
          id: item.id,
          name: item.name,
          activities: item.Activities.length ? item.Activities[0].name : '',
          activity_time: item.Activities.length ? item.Activities[0].due_date : '',
          firmAndTitle: item.AnalystHistory[0],
          client: itemSegment.Client,
          segment: {
            id: itemSegment.SubSegment.Segment.id,
            name: itemSegment.SubSegment.Segment.name
          },
          subSegment: {
            id: itemSegment.SubSegment.id,
            name: itemSegment.SubSegment.name
          },
          sentiment: 0
        })
      array.push(temp);
    })
  });
  return array;
}

export function ListAnalystUnassignedDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.id,
        name: item.name,
        firm: item.Firm[0] ? item.Firm[0].name : '',
        title: item.Firm[0] ? item.Firm[0].AnalystHistory.title : '',
        SubSegmentAnalyst: item.SubSegmentAnalyst
      })
  });
  return dto;
}

export function ListAnalystHasActivityWithClientDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.analystId,
        name: item.analystName,
        firm: item.firmName,
        clientName: item.clientName,
        clientId: item.clientId,
        SubSegmentAnalyst: []
      })
  });
  return dto;
}

export function ListNoteForClient(data) {
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

export function ListNoteForClientNew(activities, tasks) {
  let array = [];
  const dto = activities.map(item => {
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

  const dtoTasks = tasks.map(item => {
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
          activity_date: item.date
        })
      array.push(temp);
    })
  })
  return array;
}
