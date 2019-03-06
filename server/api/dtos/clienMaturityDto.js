'use strict';

export function ListClientMaturityDto(data) {
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
          desc: item.maturityByAnalystDesc
        },
        analyst: {
          id: item.analystId,
          name: item.name,
          title: item.title,
          firm_name: item.firm_name
        },
        client: {
          id: item.clientId
        },
        firm: {
          firm: item.firm
        },
        id: item.id,
      }
    );
  });
  return dto;
}
