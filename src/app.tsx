import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading } from '@ant-design/pro-components';
// @ts-ignore
import { getConfig } from '@/services/basePop';
import { getGlobalParams } from '@/utils/globalParams';
import { getMenu, throwMenu, findIndexPage } from '@/utils/utils';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/user';
import { getToken, removeToken } from './utils/token';

const loginPath = '/user/login';

const whiteRouter = ['/user/login', '/403', '/404'];

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  configInfo?: API.Config;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchConfigInfo?: () => Promise<API.Config | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg: any = await queryCurrentUser();
      if (msg.code !== 1) {
        throw msg.msg;
      }
      let userInfo = msg.data;
      userInfo = {
        ...userInfo,
        menu: getMenu(userInfo?.menu).sort((a: any, b: any) => a.sort_num - b.sort_num),
      };
      return userInfo;
    } catch (error: any) {
      console.log(error);
      notification.error({
        message: error,
        description: 'Login information has expired. Please log in again',
      });
      removeToken();
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchConfigInfo = async () => {
    const msg: any = await getConfig();
    const { data } = msg;
    return data;
  };
  // 如果不是登录页面，执行
  if (!getToken()) {
    history.push(loginPath);
  }
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    const configInfo = await fetchConfigInfo();
    console.log(configInfo);
    return {
      fetchUserInfo,
      fetchConfigInfo,
      currentUser,
      configInfo,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    fetchConfigInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (!whiteRouter.includes(location.pathname)) {
        const jumpPath = location.pathname.replace(/\/$/, '');
        // @ts-ignore
        const result = throwMenu(initialState.currentUser?.menu, jumpPath);
        let hasPage: boolean = false;
        if (result && result.path) {
          hasPage = result?.path === jumpPath;
        }
        if (!hasPage) {
          // 如果没有权限，重定向到一个带权限的页面 
          const indexPage = findIndexPage(initialState.currentUser?.menu);
          if (indexPage) {
            history.push(indexPage);
          } else {
            history.push('/403');
          }
        }
      }
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?.id,
      },
      request: async () => {
        // @ts-ignore
        const menuData = initialState?.currentUser.menu;
        return menuData;
      },
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    // @ts-ignore
    // childrenRender: (children, props) => {
    //   // if (initialState?.loading) return <PageLoading />;
    //   return (
    //     <>
    //       {children}
    //       {!props.location?.pathname?.includes('/login') && (
    //         <SettingDrawer
    //           disableUrlParams
    //           enableDarkTheme
    //           settings={initialState?.settings}
    //           onSettingChange={(settings) => {
    //             // @ts-ignore
    //             setInitialState((preInitialState) => ({
    //               ...preInitialState,
    //               settings,
    //             }));
    //           }}
    //         />
    //       )}
    //     </>
    //   );
    // },
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: 'The server successfully returned requested data.  ',
  201: 'Data creation or modification succeeded.  ',
  202: 'A request has been queued in the background (asynchronous task).  ',
  204: 'Data deleted successfully.  ',
  400: 'An error occurred in the request. The server did not create or modify data.  ',
  401: 'User has no permissions (wrong token, username, password).  ',
  403: 'The user is authorized, but access is forbidden.  ',
  404: 'The request was made for a nonexistent record, no action was taken by the server.  ',
  405: 'Request method not allowed.  ',
  406: 'Requested format not available.  ',
  410: 'The requested resource is permanently deleted and will not be retrieved.  ',
  422: 'A validation error occurred while creating an object.  ',
  500: 'Server error, please check server.  ',
  502: 'Gateway error.  ',
  503: 'Service unavailable, server temporarily overloaded or maintained.  ',
  504: 'Gateway timed out.  ',
};

/** 异常处理程序
 * @see https://beta-pro.ant.design/docs/request-cn
 */
const errorHandler = (error: ResponseError) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `${response.status} error: ${status}: ${url}`,
      description: errorText,
    });
    // setTimeout(() => {
    //   history.push('/user/login');
    // }, 1500)
  }
  // console.log(response)
  if (!response) {
    notification.error({
      description: 'Your network is abnormal and you cannot connect to the server',
      message: 'network anomaly',
    });
    // setTimeout(() => {
    //   history.push('/user/login');
    // }, 1500)
  }
  throw error;
};
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const token: string | undefined = getToken() || '';
  const authHeader = token ? { token: token } : {};
  let lastUrl = url;
  lastUrl = `${API_URL}${url.replace('/api', '')}`;
  const additionalData = getGlobalParams();
  const config = JSON.parse(JSON.stringify(options));
  const { method } = config;
  if (method === 'post') {
    config.data = {
      ...config.data,
      ...additionalData,
    };
  }
  if (method === 'get') {
    config.params = {
      ...config.params,
      ...additionalData,
    };
  }
  return {
    url: `${lastUrl}`,
    options: { ...config, interceptors: true, headers: authHeader, timeout: 120 * 1000 },
  };
};

const demoResponseInterceptors = (response: Response) => {
  // response.headers.append('interceptors', 'yes yo');
  // console.log(response, options)
  return response;
};

// https://umijs.org/zh-CN/plugins/plugin-request
export const request: RequestConfig = {
  errorHandler,
  requestInterceptors: [authHeaderInterceptor],
  responseInterceptors: [demoResponseInterceptors],
};
