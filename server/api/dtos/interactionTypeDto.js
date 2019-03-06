'use strict';

export function ListInteractionTypeDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        InteractionType: {
          id: item.id,
          is_active: item.is_active,
          asana_tags: item.asana_tags
        },
        TaskType: item.TaskType == null ? null : {
          id: item.TaskType.id,
          desc: item.TaskType.desc
        },
        TaskDesignation: item.InteractionDesignationType == null ? null : {
          id: item.InteractionDesignationType.id,
          desc: item.InteractionDesignationType.desc
        },
      }
    );
  });

  return dto;
}
