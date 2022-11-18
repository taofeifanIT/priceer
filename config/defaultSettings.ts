import { Settings as LayoutSettings } from '@ant-design/pro-components';
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'ChannelConnector',
  pwa: false,
  logo: '/subLogo.png',
  iconfontUrl: '',
  headerHeight: 48,
  splitMenus: false

};

export default Settings;
