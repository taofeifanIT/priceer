import Product from './components/Product';
import Logs from './components/Logs';
import {
  BellOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Tabs,
  Button
} from 'antd';
import 'antd/dist/antd.css';

const { TabPane } = Tabs;


const App: React.FC = () => (
  <div style={{ background: '#fff', padding: '8px' }}>
    <Tabs defaultActiveKey={'1'}>
      <TabPane
        tab={
          <span>
            <UnorderedListOutlined />
            List
          </span>
        }
        key="1"
      >
        <Product />
      </TabPane>
      <TabPane
        tab={
          <span>
            <BellOutlined />
            Logs
          </span>
        }
        key="2"
      >
        <Logs />
      </TabPane>
    </Tabs>
  </div>
);

export default App;
