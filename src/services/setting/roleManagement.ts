import { request } from 'umi';

interface rolePop {
  name: string;
  permission: Array<Number>;
  display_name: string;
  description: string;
}

export async function roleList() {
  return request(`/api/menu/list_groups`);
}

export async function addRole(params: rolePop) {
  return request(`/api/menu/add_auth_groups`, {
    method: 'POST',
    data: params,
  });
}

export async function updateRole(params: any) {
  return request(`/api/menu/edit_auth_groups`, {
    method: 'POST',
    data: params,
  });
}

export async function deleteRole(id: any) {
  return request(`/api/menu/delete_auth_group?id=${id}`);
}
