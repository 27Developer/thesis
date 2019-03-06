'use strict';

export function ListAnalystInfoDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        AnalystHistory: {
          id: item.analyst_history_id,
          is_ranking_report_author: item.is_ranking_report_author,
          team: item.team,
          title: item.title,
          is_access: item.analyst_is_access,
          insert_date: item.insert_date,
          last_updated: Math.max(item.last_updated_change_log, item.last_updated_activity_log) || item.insert_date,
          country: item.country,
          state: item.state,
          region: item.region,
          city: item.city,
          ad_owner: item.ad_owner,
        },
        ResearchType: item.research_type == null
          ? null
          : {
            desc: item.research_type
          },
        Firm: item.firm_name == null
          ? {
            name: null
          }
          : {
            name: item.firm_name,
            id: item.firm_id
          },
        VendorLeaning: item.vendor_leaning == null
          ? null
          : {
            desc: item.vendor_leaning,
          },
        Analyst: {
          id: item.analyst_id,
          is_active: (item.analyst_is_active === 1),
          name: item.analyst_name,
          client_count: item.client_alignment_count == null ? 0 : item.client_alignment_count,
          research_categories: item.categories == null ? null : item.categories,
          category_names: item.category_names == null ? null : item.category_names,
          category_ids: item.category_ids == null ? null : item.category_ids,
          analystName: item.analystName
        },
        Sentiment: item.sentiment,
        LastAdInquiry: item.last_ad_inquiry,
        UpcomingActivities: item.count_upcoming_activities
      }
    );
  });

  return dto;
}
