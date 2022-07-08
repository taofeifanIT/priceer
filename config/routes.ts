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
        component: './dashboard/Anlysis',
      },
      {
        name: 'Sales',
        path: '/dashboard/Sales',
        component: './dashboard/Sales',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/Anlysis',
  },
  {
    path: '/setting',
    name: 'Setting',
    access: 'normalRouteFilter',
    routes: [
      {
        path: '/setting/role',
        name: 'Role management',
        component: './setting/role',
      },
      {
        path: '/setting/userManagement',
        name: 'User management',
        component: './setting/userManagement',
      },
      {
        path: '/setting/menuManagement',
        name: 'Menu Management',
        component: './setting/menuManagement',
      },
    ],
  },
  {
    path: '/PreListing',
    name: 'pre-listing',
    component: './PreListing',
  },
  {
    path: '/Listed',
    name: 'Listed Product',
    component: './Listed',
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
