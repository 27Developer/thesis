'use strict';

export function ListClientRankingDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        Client: {
          id: item.ClientId,
          name: item.ClientName
        },
        RankingReport: {
          id: item.RankingReportId,
          name: item.RankingReportName,
          nickname: item.RankingReportNickName,
          analysis_year: item.RankingReportAnalysisYear,
          anticipated_publish_date: item.RankingReportAnticipatedPublishDate,
          anticipated_kickoff_date: item.RankingReportAnticipatedKickoffDate
        },
        Analyst: {
          name: item.AnalystName,
        },
        ClientRankingReport: {
          id: item.id,
          status_ranking: item.status_ranking,
          is_12month_feasible: item.is_12month_feasible,
          placement: item.placement,
          custom_name: item.custom_name
        }
      }
    );
  });
  return dto;
}
