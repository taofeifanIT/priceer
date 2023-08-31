/*
 * @Author: taofeifanIT 3553447302@qq.com
 * @Date: 2022-06-21 17:15:45
 * @LastEditors: taofeifanIT 3553447302@qq.com
 * @LastEditTime: 2022-08-05 16:10:40
 * @FilePath: \priceer\config\routes.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
      // RemovalOrderDataAnalysis
      {
        path: '/dashboard/RemovalOrderDataAnalysis',
        name: 'RemovalOrderDataAnalysis',
        component: './dashboard/RemovalOrderDataAnalysis',
      },
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
    path: '/ReportView',
    name: 'ReportView',
    routes: [
      {
        path: '/ReportView/Operation',
        name: 'Operation',
        component: './ReportView/Operation',
      },
      {
        path: '/ReportView/Warehouse',
        name: 'Warehouse',
        component: './ReportView/Warehouse',
      },
    ],
  },
  {
    path: '/Listed',
    name: 'report view',
    component: './Listed',
  },
  {
    path: '/Shipment',
    name: 'Shipment',
    component: './shipment/Shipment',
  },
  {
    path: '/RemovalOrder',
    name: 'RemovalOrder',
    routes: [
      {
        path: '/RemovalOrder/OrderList',
        name: 'Order List',
        component: './RemovalOrder/OrderList',
      },
      {
        path: '/RemovalOrder/ShipmentList',
        name: 'Shipment List',
        component: './RemovalOrder/ShipmentList',
      },
      {
        path: '/RemovalOrder/ClaimList',
        name: 'Claim List',
        component: './RemovalOrder/ClaimList',
      },
      {
        path: '/RemovalOrder/Checked',
        name: 'Checked details',
        target: '_blank',
        component: './RemovalOrder/Checked',
      },
      // RemovalOrderLog
      {
        path: '/RemovalOrder/RemovalOrderLog',
        name: 'RemovalOrderLog',
        component: './RemovalOrder/RemovalOrderLog',
      }
    ],
  },
  {
    // earlyWarning
    path: '/earlyWarning',
    name: 'earlyWarning',
    routes: [
      {
        // SalesTargetWarning
        path: '/earlyWarning/SalesTargetWarning',
        name: 'SalesTargetWarning',
        component: './earlyWarning/SalesTargetWarning',
      }
    ]
  },
  //businessUnitData\PurchasingSalesHistory
  {
    path: '/businessUnitData',
    name: 'businessUnitData',
    routes: [
      {
        path: '/businessUnitData/PurchasingSalesHistory',
        name: 'PurchasingSalesHistory',
        component: './businessUnitData/PurchasingSalesHistory',
      },
      // Product Reactivation Evaluation
      {
        path: '/businessUnitData/ProductReactivationEvaluation',
        name: 'ProductReactivationEvaluation',
        component: './businessUnitData/ProductReactivationEvaluation',
      },
      // NewProducts
      {
        path: '/businessUnitData/NewProducts',
        name: 'NewProducts',
        component: './businessUnitData/NewProducts',
      },
      // CheckProduct
      {
        path: '/businessUnitData/CheckProduct',
        name: 'CheckProduct',
        component: './businessUnitData/CheckProduct',
      }
    ]
  },
  // odika\RequirementList
  {
    path: '/odika',
    name: 'odika',
    routes: [
      {
        path: '/odika/RequirementList',
        name: 'RequirementList',
        component: './odika/RequirementList',
      },
      // odika\requirementSortList
      {
        path: '/odika/RequirementSortList',
        name: 'RequirementSortList',
        component: './odika/RequirementSortList',
      },
      // ViewDesign
      {
        path: '/odika/ViewDesign',
        name: 'ViewDesign',
        component: './odika/ViewDesign',
        target: '_blank',
        menuRender: false,
        headerRender: false,
      },
      // RequirementManagement
      {
        path: '/odika/RequirementManagement',
        name: 'RequirementManagement',
        component: './odika/RequirementManagement',
      },
      // DemandProcessControl
      {
        path: '/odika/DemandProcessControl',
        name: 'DemandProcessControl',
        component: './odika/DemandProcessControl',
      }
    ]
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

