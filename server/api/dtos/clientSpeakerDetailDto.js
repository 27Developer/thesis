'use strict';

export function toClientSpeakerDetailDto(data) {
  console.log("model data");
  console.log(data);
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        id: item.id,
        name: item.name,
        title: item.Analyst.title,
        email: item.Analyst.email,
        phone: item.Analyst.phone,
        comment: item.Analyst.comment,
        media: item.ClientSpeakerMedia == null
          ? null
          : item.ClientSpeakerMedia.map(a => {
            return Object.assign(
              {},
              {
                avatar: a.Media
              }
            );
          })
      }
    );
  });

  return dto;
}
