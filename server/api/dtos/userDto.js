'use strict';

export function ListUserDto(data) {
  const dto = data.map(item => {
    return Object.assign(
      {},
      {
        User: {
          is_active: item.Enabled,
          email: item.Attributes.email,
          first_name: item.first_name,
          last_name: item.last_name,
          nick_name: item.nick_name,
          phone: item.phone,
          last_login: item.last_login,
        },
        Client: item.Clients == null
          ? null
          : item.Clients.map(a => {
            return Object.assign(
              {},
              {
                id: a.id,
                name: a.name,
                is_active: a.is_active,
              }
            );
          })
      }
    );
  });
  return dto;
}
