import { request } from 'umi';

interface userPop {
  name: string;
  tel: string;
  email: string;
  role_id: string;
}

export async function addUser(params: userPop) {
  return request(`/api/admin_user/add_adminuser`, {
    method: 'POST',
    data: params,
  });
}

export async function updateUser(params: any) {
  return request(`/api/admin_user/edit_adminuser`, {
    method: 'POST',
    data: params,
  });
}

export async function deleteUser(id: any) {
  return request(`/api/admin_user/delete_adminuser?id=${id}`, {
    method: 'GET',
  });
}

// /api/adminuser/list_adminusers
export async function userList(params: any) {
  return request('/api/admin_user/list_adminusers', {
    method: 'GET',
    params
  })
}