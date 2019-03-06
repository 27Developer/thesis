'use strict';

export function ListFirmInfoDto(data) {
  const dto = data.map(item => {
    return Object.assign({}, {
      isSelected: false,
      Firm: {
        id: item.id,
        is_active: item.is_active,
        name: item.name,
      },
      Categories: [],
      NumOfAnalyst: item.numofanalyst ? item.numofanalyst : 0,
      NumOfClient: item.numOfClient ? item.numOfClient : 0,
    });
  });

  return dto;
}
