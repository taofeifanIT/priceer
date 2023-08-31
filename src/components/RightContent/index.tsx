import { getGlobalParams, setGlobalParams, setCountry } from '@/utils/globalParams';
import { ControlOutlined } from '@ant-design/icons';
import { Button, Form, Popover, Select, Space, Tag } from 'antd';
import React from 'react';
import { SelectLang, useModel } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const ItmesEnv = {
  dev: 'blue',
  stag: 'green',
  pro: 'yellow',
};

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [visible, setVisible] = React.useState(false);
  if (!initialState || !initialState.settings) {
    return null;
  }
  const { navTheme, layout } = initialState.settings;
  const { configInfo = {} } = initialState;
  const publicParms: any = getGlobalParams();
  const storeName = configInfo.store?.find((item: any) => item.id === publicParms.store_id)?.nick_name || '';
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const onFinish = (fieldsValue: any) => {
    setGlobalParams(JSON.stringify(fieldsValue));
    const storeId = fieldsValue.store_id;
    const country = configInfo.store?.find((item: any) => item.id === storeId)?.country;
    setCountry(country);
    setVisible(false);
    history.go(0);
  };

  const onReset = () => {
    form.resetFields();
  };

  const colorByStoreName = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, '0')

  React.useEffect(() => {
    if (publicParms && visible) {
      form.setFieldsValue(publicParms);
    }
  }, [visible]);
  return (
    <Space className={className}>
      <Tag color={ItmesEnv[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
      {storeName && <Tag color={colorByStoreName}>{storeName}</Tag>}
      <Popover
        id="popPopover"
        placement="bottomRight"
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
        content={
          <div>
            <Form
              name="control-ref"
              form={form}
              initialValues={{
                company_id: 0,
                country_id: 0,
                store_id: 0,
              }}
              {...formItemLayout}
              onFinish={onFinish}
            >
              {Object.keys(configInfo).map((key) => {
                return (
                  <Form.Item name={key + '_id'} key={key + '_id'} label={key}>
                    <Select
                      size="small"
                      style={{ width: '150px' }}
                      placeholder={`Select ${key}`}
                      allowClear
                    >
                      <Select.Option key={`option ${key}`} value={0}>
                        All {key}
                      </Select.Option>
                      {configInfo[key].map((item: { id: string; name: string }) => {
                        return (
                          <Select.Option key={key + item.id} value={item.id}>
                            {item.name}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              })}
              <Form.Item
                wrapperCol={{
                  sm: { offset: 8 },
                }}
              >
                <Button type="primary" size="small" htmlType="submit">
                  Submit
                </Button>
                <Button
                  style={{ marginLeft: '10px' }}
                  type="default"
                  size="small"
                  onClick={onReset}
                >
                  reset
                </Button>
              </Form.Item>
            </Form>
          </div>
        }
      >
        <ControlOutlined />
      </Popover>
      <Avatar />
      <SelectLang className={styles.action} />
    </Space>
  );
};

export default GlobalHeaderRight;
