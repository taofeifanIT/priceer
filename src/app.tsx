import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
// @ts-ignore
import type { RunTimeLayoutConfig, RequestConfig } from 'umi';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import type { ResponseError, RequestOptionsInit } from 'umi-request';
import { currentUser as queryCurrentUser } from './services/user';
import { notification } from 'antd';
import { getToken, removeToken } from './utils/token';
import { getMenu, throwMenu } from '@/utils/utils'
const loginPath = '/user/login';

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
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg: any = await queryCurrentUser();
      if (!msg.code) {
        throw msg.msg
      }
      let userInfo = msg.data
      userInfo = {
        ...userInfo,
        menu: getMenu(userInfo?.menu).sort(
          (a: any, b: any) => a.sort_num - b.sort_num,
        )
      }
      return userInfo
    } catch (error: any) {
      notification.error({
        message: error,
        description: 'Login information has expired. Please log in again',
      });
      removeToken();
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (!getToken()) {
    history.push(loginPath);
  }
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (location.pathname !== loginPath) {
        // @ts-ignore
        let result = throwMenu(initialState.currentUser?.menu, location.pathname)
        let hasPage: boolean = false
        if (result && result.path) {
          hasPage = (result?.path === history.location.pathname)
        }
        if (!hasPage) {
          history.push('/403');
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
        // initialState.currentUser 中包含了所有用户信息
        // const { data } = await fetchMenuData();
        // const menuData = getMenu(data).sort(
        //   (a: any, b: any) => a.sort_num - b.sort_num,
        // );
        // @ts-ignore
        const menuData = initialState?.currentUser.menu
        return menuData;
      },
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    // @ts-ignore
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                // @ts-ignore
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
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

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
    // setTimeout(() => {
    //   history.push('/user/login');
    // }, 1500)
  }
  throw error;
};
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const token: string | undefined = getToken() || '';
  let authHeader = {};
  authHeader = { token: token || '' };
  let lastUrl = url;
  lastUrl = `http://n.demo.com${url.replace('/api', '')}`;
  return {
    url: `${lastUrl}`,
    options: { ...options, interceptors: true, headers: authHeader, timeout: 30 * 1000 },
  };
};
// https://umijs.org/zh-CN/plugins/plugin-request
export const request: RequestConfig = {
  errorHandler,
  requestInterceptors: [authHeaderInterceptor],
};