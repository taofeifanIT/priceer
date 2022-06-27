// @ts-ignore
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser() {
  return request<{
    data: any;
  }>('/api/admin_user/getInfo', {
    method: 'POST'
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin() {
  return request<Record<string, any>>('/api/login/logout', {
    method: 'POST'
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams) {
  return request<API.LoginResult>('/api/login/login', {
    method: 'POST',
    data: body,
  });
}


/** 获取用户菜单接口 */
export async function fetchMenuData() {
  return request<API.Menu>('/api/admin_user/getMenu', {
    method: 'POST'
  });
}