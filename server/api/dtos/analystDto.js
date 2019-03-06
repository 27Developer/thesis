'use strict';
import config from '../../config/environment/shared';

export function ListAnalystDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        AnalystHistory: {
          id: item.id,
          is_ranking_report_author: item.is_ranking_report_author,
          team: item.team,
          title: item.title,
          is_active: item.is_active,
          email: item.email,
          phone: item.phone,
          is_access: item.is_access,
          twitter: item.twitter,
          city: item.city,
          country: item.country,
          state: item.state,
          region: item.region,
          insert_date: item.insert_date,
          ad_owner: item.ad_owner
        },
        ResearchType: item.ResearchType == null
          ? null
          : {
            id: item.ResearchType.id,
            is_active: item.ResearchType.is_active,
            desc: item.ResearchType.desc
          },
        Firm: item.Firm == null
          ? null
          : {
            id: item.Firm.id,
            is_active: item.Firm.is_active,
            name: item.Firm.name
          },
        VendorLeaning: item.VendorLeaning == null
          ? null
          : {
            id: item.VendorLeaning.id,
            desc: item.VendorLeaning.desc,
            is_active: item.VendorLeaning.is_active
          },
        Analyst: {
          id: item.Analyst.id,
          is_active: item.Analyst.is_active,
          name: item.Analyst.name,
          client_count: item.Analyst.ClientAnalystAlignmentHistory == null ? 0 : item.Analyst.ClientAnalystAlignmentHistory.length,
          Research: item.Analyst.Research == null
            ? null
            : item.Analyst.Research.map(c => {
              return Object.assign(
                {},
                {
                  id: c.id,
                  desc: c.desc,
                  is_active: c.is_active,
                  insert_date: c.AnalystResearchCategories.insert_date,
                  AnalystResearchCategoriesId: c.AnalystResearchCategories.id
                }
              );
            })
        }
      }
    );
  });

  return dto;
}


export function ListClientAssocialAnalystDto(data) {
  let array = [];
  data.map(item => {
    let temp = Object.assign(
      {},
      {
        id: item.id,
        name: item.name,
        SubSegment: item.SubSegmentAnalyst,
        sentiment: item.sentiment,
        activity: item.activity
      })
    array.push(temp);
  });
  return array;
}

export function ListNoteForAnalyst(data) {
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
          activity_date: item.due_date
        })
      array.push(temp);
    })
  })
  return array;
}

export function ListNoteForAnalystNew(activities, tasks) {
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

export function ListInsightForAnalyst(data, clientContextId, role) {
  let array = [];
  const dto = data.map(subData => {
    var item = subData.dataValues;
    if (item.InsightClientStatus.length != 0 && clientContextId) {
      item.publish = false;
      item.star = false;
      item.InsightClientStatus.forEach(insight => {
        if (insight.client_id == clientContextId && insight.publish) {
          item.publish = true;
        }
        if (insight.client_id == clientContextId && insight.star) {
          item.star = true;
        }
      })

      let temp = Object.assign(
        {},
        {
          Clients: item.Clients,
          created_by: item.created_by,
          created_date: item.created_date,
          desc: item.desc,
          id: item.id,
          is_active: item.is_active,
          last_updated_by: item.last_updated_by,
          published_date: item.published_date,
          sensitivity: item.sensitivity,
          sentiment: item.sentiment,
          type: item.type,
          updated_date: item.updated_date,
          publish: item.publish,
          star: item.star
        })
      
      if (role == config.role.spotlightAdmin || temp.publish) {
        array.push(temp);  
      }
    }
    else {
      let temp = Object.assign(
        {},
        {
          Clients: item.Clients,
          created_by: item.created_by,
          created_date: item.created_date,
          desc: item.desc,
          id: item.id,
          is_active: item.is_active,
          last_updated_by: item.last_updated_by,
          published_date: item.published_date,
          sensitivity: item.sensitivity,
          sentiment: item.sentiment,
          type: item.type,
          updated_date: item.updated_date,
          publish: false,
          star: false
        })
      if (role == config.role.spotlightAdmin || temp.publish) {
        array.push(temp);
      }
    }
  })
  return array;
}

export function ListInsightForCollection(data, role) {
  let array = [];
  const dto = data.map(subData => {
    var item = subData.dataValues;
    if (item.InsightClientStatus.length != 0) {
      item.publish = false;
      item.star = false;
      item.InsightClientStatus.forEach(insight => {
        if (insight.publish) {
          item.publish = true;
        }
        if (insight.star) {
          item.star = true;
        }
      })

      let temp = Object.assign(
        {},
        {
          Analysts: item.Analysts, 
          Clients: item.Clients,
          created_by: item.created_by,
          created_date: item.created_date,
          desc: item.desc,
          id: item.id,
          is_active: item.is_active,
          last_updated_by: item.last_updated_by,
          published_date: item.published_date,
          sensitivity: item.sensitivity,
          sentiment: item.sentiment,
          type: item.type,
          updated_date: item.updated_date,
          publish: item.publish,
          insight_status: item.publish,
          star: item.star
        })
      
      if (role == config.role.spotlightAdmin || temp.publish) {
        array.push(temp);  
      }
    }
    else {
      let temp = Object.assign(
        {},
        {
          Analysts: item.Analysts,
          Clients: item.Clients,
          created_by: item.created_by,
          created_date: item.created_date,
          desc: item.desc,
          id: item.id,
          is_active: item.is_active,
          last_updated_by: item.last_updated_by,
          published_date: item.published_date,
          sensitivity: item.sensitivity,
          sentiment: item.sentiment,
          type: item.type,
          updated_date: item.updated_date,
          publish: false,
          insight_status: false,
          star: false
        })
      if (role == config.role.spotlightAdmin || temp.publish) {
        array.push(temp);
      }
    }
  })
  return array;
}