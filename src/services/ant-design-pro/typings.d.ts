// @ts-ignore
/* eslint-disable */

declare namespace API {

  type Config = {
    store: { id: number, name: string }[];
    company: { id: number, name: string }[];
    country: { id: number, name: string }[];
    market: { id: number, name: string }[];
  }

  type globalParameter = {
    store?: number;
    company?: number;
    country?: number;
    market?: number;
  }

  type CurrentUser = {
    id: number,
    username: string,
    status: number,
    add_time: number,
    last_login_time: number,
    last_login_ip: string,
    group_id: number,
    add_by: number,
    tag_ids: number[],
    open_tag_permission: number,
    authGroup: any,
    menu: any[]
  };

  type LoginResult = {
    code: number;
    msg: string;
    data: {
      token: string;
    }
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type Menu = {
    code: number;
    msg: number;
    data: {
      id: number,
      name: string,
      title: string,
      status: number,
      pid: number,
      icon: string,
      sort_num: number,
      component: string,
      is_show: number,
      children?: Menu
    }[]
  }
}
