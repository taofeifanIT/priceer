export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    access: 'normalRouteFilter',
    routes: [
      {
        path: '/dashboard/Anlysis',
        name: 'Anlysis',
        icon: 'smile',
        component: './dashboard/Anlysis',
        access: 'normalRouteFilter'
      },
      {
        name: 'Sales',
        path: '/dashboard/Sales',
        component: './dashboard/Sales',
        access: 'normalRouteFilter'
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/Anlysis',
    access: 'normalRouteFilter'
  },
  {
    path: '/setting',
    name: 'Setting',
    icon: 'SettingOutlined',
    access: 'normalRouteFilter',
    routes: [
      {
        path: '/setting/role',
        name: 'Role management',
        component: './setting/role',
        access: 'normalRouteFilter'
      },
      {
        path: '/setting/userManagement',
        name: 'User management',
        component: './setting/userManagement',
        access: 'normalRouteFilter'
      },
      {
        path: '/setting/menuManagement',
        name: 'Menu Management',
        component: './setting/menuManagement',
        access: 'normalRouteFilter'
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: './404',
  },
  {
    path: '/403',
    name: '403',
    component: './403',
  },
];
