'use strict';
import _ from 'lodash';

export function AnalystForCalendarDto (data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        segment: {
          id: item.id,
          name: item.name
        },
        SubSegment: item.SubSegment == null
          ? []
          : item.SubSegment.map(a => {
            return Object.assign(
              {},
              {
                id: a.id,
                desc: a.name,
                detail: a.detail,
                SubSegmentAnalyst:  a.SubSegmentAnalyst == null
                ? []
                  : a.SubSegmentAnalyst.map(subSegment => {
                    return Object.assign(
                      {},
                      {
                        id: subSegment.Analyst ? subSegment.Analyst.id : '',
                        name: subSegment.Analyst ? subSegment.Analyst.name : '',
                        firm: subSegment.Analyst.AnalystHistory.length == 0 || subSegment.Analyst.Firm.length == 0 ? null : _.find(subSegment.Analyst.Firm, { 'id' : subSegment.Analyst.AnalystHistory[0].firm_id}).name,
                        clientName: subSegment.Client ? subSegment.Client.name : '',
                        clientId: subSegment.Client ? subSegment.Client.id : ''
                      }
                    );
                  })

          }
            );
          }),
      }
    );
  });
  return dto;
}
