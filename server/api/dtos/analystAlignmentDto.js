'use strict';

export function ListAnalystAlignmentDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        importanceByAnalystCd: {
          code: item.code,
          desc: item.desc
        },
        maturityByAnalyst: {
          code: item.maturityByAnalystId,
          desc: item.maturityByAnalystDesc,
          detail: item.maturityDetail
        },
        researchCategory: {
          desc: item.researchCategory
        },
        rankingReport: {
          rankingReportName: item.rankingReportName
        },
        influence: item.influence,
        id: item.id,
      }
    );
  });
  return dto;
}
