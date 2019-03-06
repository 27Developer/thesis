'use strict';

export function ListClientAnalystCalendarDto(item, task) {
  return Object.assign(
    {
      task,
      maturityByAnalyst: {
        code: item.maturityByAnalystId,
        desc: item.maturityByAnalystDesc
      },
      analyst: {
        id: item.analystId,
        name: item.analystName
      },
      firm: {
        name: item.firmName
      },
      client: {
        id: item.clientId
      },
      id: item.id,
    }
  );
}
