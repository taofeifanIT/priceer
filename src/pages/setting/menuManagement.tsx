import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Cascader,
  Switch,
  InputNumber,
  message,
  Divider,
  Popconfirm,
  Tag,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import type { FormInstance } from 'antd/lib/form';
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import styles from './style/menuManagement.less';
import { listRules, addRule, deleteRule, editRule } from '@/services/setting/menuManagement';
import * as Icons from '@ant-design/icons';

function getIcons(
  params: number,
): {
  iconName: string;
  iconComponent: object;
}[] {
  const iconData = Object.keys(Icons).map((key) => {
    const AntIcon = Icons[key];
    return {
      iconName: key,
      iconComponent: <AntIcon />,
    };
  });
  iconData.length = params;
  return iconData;
}

function IconSelect(props: {
  setIconName: any;
  iconVisible: boolean;
  setIconVisible: (status: boolean) => void;
}) {
  const getCurrtIcon = (iconName: string): void => {
    props.setIconName(iconName);
    props.setIconVisible(false);
  };

  return (
    <span>
      {/* <Icons.AccountBookOutlined /> */}
      <AddModal
        title="Icon select"
        width={790}
        visible={props.iconVisible}
        onOk={() => props.setIconVisible(false)}
        onCancel={() => props.setIconVisible(false)}
        content={getIcons(400).map((Item, key) => {
          const tempIcon = Item.iconComponent;
          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={'card' + key}
              className={styles.cardIcon}
              onClick={() => getCurrtIcon(Item.iconName)}
            >
              {tempIcon}
            </div>
          );
        })}
      />
    </span>
  );
}

interface foderOptions {
  value: any;
  label: string;
  children: any[];
}

const forderOptions = (children: foderOptions[]) => [
  {
    value: 0,
    label: 'root',
    children,
  },
];

function getNewTree(params: any[]): any {
  return params.map((item) => {
    return {
      value: item.id,
      label: item.title,
      children: item.children ? getNewTree(item.children) : [],
    };
  });
}

const formRef: any = React.createRef<FormInstance>();

function FromComponet(props: any) {
  const layout = {
    labelCol: {
      span: 7,
    },
    wrapperCol: {
      span: 12,
    },
  };
  const [iconVisible, setIconVisible] = useState(false);
  const [iconName, setIconName] = useState('');
  const [showIcon, setShowIcon] = useState(<></>);
  const [options, setOption] = useState([]);

  const getIcon = () => {
    if (formRef.current.getFieldValue('icon')) {
      const TempIcon = Icons[formRef.current.getFieldValue('icon')];
      return <TempIcon />;
    } else {
      return <></>;
    }
  };

  const findMenu = (menuId: number, menu: any[]) => {
    let target: any = null
    menu.forEach((item: any) => {
      if (item.value === menuId) {
        target = item
      } else {
        if (item.children.length && !target) {
          target = findMenu(menuId, item.children)
        }
      }
    })
    return target
  }

  const changeOptions = (val: number[]) => {
    let component = ''
    val.forEach(op => {
      if (op === 0) {
        component += "."
      } else {
        component += '/' + findMenu(op, options).label
      }
    })
    const title = formRef.current.getFieldValue("title")
    formRef.current.setFieldsValue({
      component: component + (title ? '/' + title : ''),
    });
  }

  const changeComponent = (e: any) => {
    const componentName = e.target.value
    const pid = formRef.current.getFieldValue("pid")
    if (pid.toString() === '0') {
      formRef.current.setFieldsValue({
        component: './' + componentName,
      });
    }
    if (pid.length > 1) {
      const component = formRef.current.getFieldValue("component")
      const paths = component.split("/")
      paths[paths.length - 1] = componentName
      formRef.current.setFieldsValue({
        component: paths.join("/")
      });
    }
  }
  useEffect(() => {
    formRef.current.setFieldsValue({
      icon: iconName,
    });
    setShowIcon(getIcon());
  }, [iconName]);
  useEffect(() => {
    const newRree: any = getNewTree(props.menuData);
    // console.log(newRree)
    setOption(newRree);
  }, [props.menuData]);

  return (
    <>
      <Form
        {...layout}
        ref={formRef}
        name="control-ref"
        initialValues={{
          is_show: true,
          pid: [0],
          component: './'
        }}
      >
        <Form.Item
          name="name"
          label="Menu Name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="pid"
          label="Forder"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Cascader options={forderOptions(options)} changeOnSelect />
        </Form.Item>
        <Form.Item
          name="title"
          label="Component"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input onChange={changeComponent} />
        </Form.Item>
        <Form.Item
          name="component"
          label="Path"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="is_show"
          label="Is Show"
          rules={[
            {
              required: true,
            },
          ]}
          valuePropName={'checked'}
        >
          <Switch checkedChildren="open" unCheckedChildren="close" defaultChecked />
        </Form.Item>
        <Form.Item
          name="sort_num"
          label="order"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber min={0} max={100} />
        </Form.Item>
        <Form.Item
          name="external_open"
          label="External Open"
          rules={[
            {
              required: true,
            },
          ]}
          valuePropName={'checked'}
        >
          <Switch checkedChildren="open" unCheckedChildren="close" />
        </Form.Item>
        <Form.Item
          label="Icon"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Form.Item name="icon" noStyle>
            <Input
              style={{
                width: '100px',
              }}
              onClick={() => {
                setIconVisible(true);
              }}
            />
          </Form.Item>
          <span
            style={{
              marginLeft: '5px',
              cursor: 'pointer',
            }}
          >
            {showIcon}
          </span>
        </Form.Item>
      </Form>
      <IconSelect
        iconVisible={iconVisible}
        setIconName={setIconName}
        setIconVisible={setIconVisible}
      />
    </>
  );
}

const DeleteComponent = React.memo((props: { id: number; initData: () => void }) => {
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const showPopconfirm = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    deleteRule(props.id)
      .then((res) => {
        if (res.code) {
          message.success('Operation successful!');
          props.initData();
        } else {
          throw res.message;
        }
      })
      .catch((e: string) => {
        message.error(e);
      })
      .finally(() => {
        setVisible(false);
        setConfirmLoading(false);
      });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Popconfirm
      title="are you sure delete it?"
      open={visible}
      onConfirm={handleOk}
      okButtonProps={{
        loading: confirmLoading,
      }}
      onCancel={handleCancel}
    >
      <a onClick={showPopconfirm}>delete</a>
    </Popconfirm>
  );
}, (preProps, nextProps) => {
  if (preProps.id !== nextProps.id) {
    return false
  } else {
    return true
  }
})


const AddModal = React.memo((props: {
  title: string;
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  content: object;
  width?: number;
  confirmLoading?: boolean;
}) => {
  return (
    <>
      <Modal {...props} okText="ok" cancelText="cancel">
        {props.content}
      </Modal>
    </>
  );
})
// const AddModal = (props: {
//   title: string;
//   visible: boolean;
//   onOk: () => void;
//   onCancel: () => void;
//   content: object;
//   width?: number;
//   confirmLoading?: boolean;
// }) => {
//   console.log("重新渲染")
//   return (
//     <>
//       <Modal {...props} okText="ok" cancelText="cancel">
//         {props.content}
//       </Modal>
//     </>
//   );
// }

function TreeData() {
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'path',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: 'icon',
      dataIndex: 'icon',
      key: 'icon',
      render: (iconkey: any) => {
        const Icon = Icons[iconkey]
        return <Icon />
      }
    },
    {
      title: 'Display or not',
      dataIndex: 'is_show',
      key: 'is_show',
      render: (text: boolean) =>
        !text ? <Tag color="magenta">hide</Tag> : <Tag color="green">display</Tag>,
    },
    {
      title: 'order',
      dataIndex: 'sort_num',
      align: 'center',
      key: 'sort_num',
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: any, record: any) => (
        <>
          <a
            onClick={() => {
              setVisible(true);
              setEditRecord(record);
            }}
          >
            edit
          </a>
          <Divider type="vertical" />
          <DeleteComponent initData={initData} id={record.id} />
        </>
      ),
    },
  ];
  const [data, setData] = React.useState([]);
  const [visible, setVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  function initData() {
    setTableLoading(true);
    listRules()
      .then((res) => {
        setData(res.data.auth_rules.sort((a: any, b: any) => a.sort_num - b.sort_num));
      })
      .catch((e: any) => {
        message.error('data init error!:' + e);
        console.error(e);
      })
      .finally(() => {
        setTableLoading(false);
      });
  }

  function editFrom(record: any) {
    formRef.current.setFieldsValue({
      ...record,
      pid: [record.pid],
      hidden: !record.hidden,
      component: record.component,
    });
  }

  function operation(api: any, params: object) {
    api(params)
      .then((res: any) => {
        if (res.code) {
          message.success('Operation successful!');
          initData();
        } else {
          throw res.message;
        }
      })
      .catch((e: string) => {
        message.error(e);
      })
      .finally(() => {
        setVisible(false);
      });
  }

  useEffect(() => {
    if (!visible && formRef.current) {
      formRef.current.resetFields();
      setEditRecord(null);
      setConfirmLoading(false);
    }
  }, [visible]);
  useEffect(() => {
    if (visible && formRef.current) {
      editFrom(editRecord);
    } else {
      return;
    }
  }, [editRecord]);
  useEffect(() => {
    // 相当于 componentDidMount
    initData();
  }, []);
  return (
    <PageContainer
      waterMarkProps={{ content: '' }}
    >
      <Card
        size="small"
        bordered={true}
        style={{
          width: '100%',
        }}
      >
        <Button
          style={{
            float: 'right',
          }}
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setVisible(true);
          }}
        >
          add route
        </Button>
      </Card>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record: any) => record.id}
        pagination={false}
        loading={tableLoading}
      />
      <AddModal
        width={600}
        title={editRecord ? 'edit' : 'add'}
        visible={visible}
        confirmLoading={confirmLoading}
        onOk={() => {
          setConfirmLoading(true);
          formRef.current
            .validateFields()
            .then((value: any) => {
              value.is_show = value.is_show ? 1 : 0;
              value.external_open = value.external_open ? 1 : 0;
              value.pid = value.pid.pop();
              let api: any = addRule;

              if (editRecord) {
                api = editRule;
                value.id = (editRecord as any).id;
              }

              operation(api, value);
            })
            .catch((errorInfo: object) => {
              setConfirmLoading(false);
              console.log(errorInfo);
            }); // setVisible(false)
        }}
        onCancel={() => setVisible(false)}
        content={<FromComponet menuData={data} />}
      />
    </PageContainer>
  );
}

export default TreeData;
