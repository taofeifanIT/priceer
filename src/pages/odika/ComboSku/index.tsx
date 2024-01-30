import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { combo_sku_list, combo_sku_add, combo_sku_del } from '@/services/odika/comboSku'
import { match_list } from '@/services/odika/skuMatching'
import type { ComboSkuItem } from '@/services/odika/comboSku'
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Modal, Divider, Button, Select, Input, InputNumber, message, Popconfirm, Form, Spin, Dropdown, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const EnquiryModal: any = forwardRef((props: {
  refresh: () => void;
}, ref) => {
  const formRef = useRef<any>();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skuList, setSkuList] = useState<{
    internal_id: number;
    sku: string;
    land_cost_us: string;
  }[]>([]);
  const onClose = () => {
    setVisible(false);
    formRef.current.resetFields();
    props.refresh();
  }

  const handleCancel = () => {
    onClose();
  }

  const handleOk = () => {
    formRef.current.validateFields().then(async (values: any) => {
      const params = {
        ...values,
        items: values.items.map((item: any) => {
          return {
            sku: item.sku,
            land_price: item.land_price,
            quantity: item.quantity,
            internal_id: skuList.find((subItem) => subItem.sku === item.sku)?.internal_id
          }
        })
      }
      setConfirmLoading(true);
      combo_sku_add(params).then((res) => {
        const { code, msg } = res
        if (code === 1) {
          message.success('Add success')
          onClose();
        } else {
          throw msg
        }
      }).catch((err) => {
        message.error(err)
      }).finally(() => {
        setConfirmLoading(false);
      })

    }).catch((err: any) => {
      console.log(err);
    });
  }

  const getMatchList = () => {
    setLoading(true)
    match_list().then((res) => {
      const { data, code, msg } = res
      if (code === 1) {
        setSkuList(data.ns_sku)
      } else {
        throw msg
      }
    }).catch((err) => {
      message.error(err)
    }).finally(() => {
      setLoading(false)
    })
  }
  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      if (skuList.length === 0) {
        getMatchList()
      }
    }
  }));

  return <Modal
    title="Add"
    open={visible}
    onOk={handleOk}
    confirmLoading={confirmLoading}
    onCancel={handleCancel}
    width={600}
  >
    <Spin spinning={loading}>
      <Form
        ref={formRef}
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        initialValues={{ items: [{}] }}
      >
        <Form.Item
          label="Seller SKU"
          name="seller_sku"
          rules={[{ required: true, message: 'Please input your Seller SKU!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please input your price!' }]}
        >
          <InputNumber style={{ width: '150px' }} />
        </Form.Item>
        {/* from list */}
        <Form.List
          name="items"
          // 增加校验 至少有一个item
          rules={[
            {
              validator: async (_, items) => {
                if (!items || items.length < 1) {
                  message.error('At least 1 item');
                  return Promise.reject(new Error('At least 1 item'));
                }
              },
            },
          ]}
        >
          {(fields: { [x: string]: any; key: any; name: any; }[], { add, remove }: any) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={"itemsDiv"} style={{ position: 'relative' }}>
                  {
                    index === 0 ? <Divider>Items</Divider> : <Divider />
                  }
                  <Form.Item
                    label="SKU"
                    {...restField}
                    name={[name, 'sku']}
                    rules={[{ required: true, message: 'Missing SKU' }]}
                  >
                    {/* <Input placeholder="sku" /> */}
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select SKU"
                      optionFilterProp="children"
                      onChange={(value) => {
                        // 联动Land Price
                        const land_price = skuList.find((item) => item.sku === value)?.land_cost_us
                        // 设置Land Price
                        formRef.current.setFieldsValue({
                          items: [
                            ...formRef.current.getFieldValue('items').map((item: any, subIndex: number) => {
                              if (subIndex === index) {
                                return {
                                  ...item,
                                  land_price
                                }
                              }
                              return item
                            })
                          ]
                        })
                      }}
                      filterOption={(input, option: any) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {
                        skuList?.map((item) => {
                          return <Select.Option key={item.internal_id} value={item.sku}>{item.sku}</Select.Option>
                        })
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Land Price"
                    {...restField}
                    name={[name, 'land_price']}
                    rules={[{ required: true, message: 'Missing Land Price' }]}
                  >
                    <InputNumber style={{ width: '150px' }} />
                  </Form.Item>
                  <Form.Item
                    label="Quantity"
                    {...restField}
                    name={[name, 'quantity']}
                    rules={[{ required: true, message: 'Missing Quantity' }]}
                  >
                    <InputNumber style={{ width: '150px' }} />
                  </Form.Item>
                  <MinusCircleOutlined style={{
                    position: 'absolute',
                    top: index === 0 ? 50 : 35,
                    right: 60,
                  }} onClick={() => remove(name)} />
                </div>
              ))}
              <Divider />
              <Form.Item
                wrapperCol={{ span: 14, offset: 6 }}
              >
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Spin>
  </Modal>
});


const deleteSku = (id: number, refresh: () => void) => {
  combo_sku_del({ id }).then((res) => {
    const { code, msg } = res
    if (code === 1) {
      message.success('Delete success')
      refresh()
    } else {
      throw msg
    }
  }).catch((err) => {
    message.error(err)
  })
}

const columns: ProColumns<ComboSkuItem>[] = [
  {
    title: 'Seller SKU',
    dataIndex: 'seller_sku',
    copyable: true,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    search: false,
  },
  {
    title: 'Creator',
    width: 120,
    dataIndex: 'create_name',
    search: false,
  },
  // Action
  {
    title: 'Action',
    width: 120,
    key: 'option',
    valueType: 'option',
    render: (_, record, __, action) => {
      // <a key="delete">Delete</a>
      return [
        <Popconfirm
          key="delete"
          title="Are you sure delete this SKU?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            deleteSku(record.id, (action as any).reload)
          }}
        >
          <a>Delete</a>
        </Popconfirm>,
      ];
    },
  },
];

const expandedRowRender = (record: ComboSkuItem) => {
  return (
    <ProTable
      columns={[
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Land Price', dataIndex: 'land_price', key: 'land_price' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
      ]}
      headerTitle={false}
      search={false}
      options={false}
      dataSource={record.items}
      pagination={false}
    />
  );
};

export default () => {
  const enquiryModalRef: any = useRef(null);
  const tableRef: any = useRef(null);
  const [allData, setAllData] = useState<ComboSkuItem[]>([]); // 展开的行
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]); // 展开的行
  //展开全部
  const expandAll = async () => {
    const tempData = allData.map((item) => {
      return item.id;
    });
    setExpandedRowKeys(tempData);
  }
  const items: MenuProps['items'] = [
    {
      label: "Expand all",
      key: '0',
      onClick: () => {
        expandAll();
      },
    },
    {
      label: "Fold all",
      key: '1',
      onClick: () => {
        setExpandedRowKeys([]);
      },
    },
  ];
  return (
    <>
      <ProTable<ComboSkuItem>
        columns={columns}
        actionRef={tableRef}
        request={async (params) => {
          const tempParams = {
            ...params,
            len: params.pageSize,
            page: params.current,
          };
          const res = await combo_sku_list(tempParams);
          setAllData(res.data.data);
          return {
            data: res.data.data,
            success: res.code === 1,
            total: res.data.total,
          };
        }}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
        }}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (expandedRows) => {
            setExpandedRowKeys(expandedRows as number[]);
          },
        }}
        search={{
          labelWidth: 'auto',
          // 紧凑模式
        }}
        title={() =>
          <Dropdown
            menu={{ items }}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Expand
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>}
        dateFormatter="string"
        headerTitle=""
        options={{
          // search: true,
          reload: true,
        }}
        toolBarRender={() => [
          <Button key="primary" type="primary" onClick={() => {
            enquiryModalRef?.current.open();
          }}>
            Create combo
          </Button>,
        ]}
      />
      <EnquiryModal ref={enquiryModalRef} refresh={() => {
        tableRef.current.reload()
      }} />
    </>
  );
};