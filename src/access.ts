/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
// import { history } from 'umi';
// import { throwMenu } from './utils/utils';

export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    // @ts-ignore
    canAdmin: currentUser && currentUser.usernmae === 'admin',
    // normalRouteFilter: () => {
    //   // @ts-ignore
    //   let result = throwMenu(currentUser?.menu, history.location.pathname)
    //   let hasPage: boolean = false
    //   if (result && result.path) {
    //     hasPage = (result?.path === history.location.pathname)
    //   }
    //   return hasPage
    // },
  };
}
