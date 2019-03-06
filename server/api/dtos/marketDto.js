'use strict';


export function ListMarketDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.id,
        name: item.name,
        Researchs: item.Researchs.map(research => { return Object.assign({}, { id: research.id, name: research.desc }) }),
      })
  });
  return dto;
}
