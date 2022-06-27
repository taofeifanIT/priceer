import { request } from 'umi';

export async function listRules() {
  return request('/api/menu/list_rules');
}

export async function addRule(params: Object) {
  return request('/api/menu/add_rules', {
    method: 'POST',
    data: params,
  });
}

export async function authority() {
  return request('/api/authority');
}

export async function deleteRule(id: any) {
  return request(`/api/menu/delete_rules?id=${id}`, {
    method: 'get',
  });
}

export async function editRule(params: any) {
  return request(`/api/menu/edit_rules`, {
    method: 'POST',
    data: params,
  });
}
