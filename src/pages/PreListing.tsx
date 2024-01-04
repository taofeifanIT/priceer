import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Button, Space, Typography, message, Upload, Modal, Form, Input, InputNumber, Popconfirm, Select } from 'antd';
import type { addItems, editItems, listingItem } from '@/services/preListing'
import { list, add, edit, del, listing } from '@/services/preListing'
import { createDownload } from '@/utils/utils'
import { stores } from '@/services/basePop'
import type { storeItem } from '@/services/basePop'
import { getToken } from '@/utils/token'

const { Text } = Typography;


export type TableListItem = {
    id: number;
    vendor_sku: string;
    vendor_price: string;
    availability: number;
    brand: string;
    vpn: string;
    newegg_id: string;
    admin_id: number;
    is_delete: number;
    asin: string;
    add_time: string;
    update_time: string;
    delete_time: string;
};



type actionItems = {
    callback: () => void;
}

const ActionModel = React.forwardRef((props: actionItems, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false)
    const [editRecordId, setEditRecordId] = useState<number>()
    const [form] = Form.useForm();
    const handleOk = () => {
        form.validateFields().then(async (values: addItems) => {
            setLoading(true)
            let api = add
            let params = JSON.parse(JSON.stringify(values))
            if (editRecordId) {
                api = edit
                params = {
                    id: editRecordId,
                    ...params
                }
            }
            api(params).then(res => {
                if (res.code) {
                    message.success("Operation successful!")
                    // setLoading(false)
                    setIsModalVisible(false);
                    setTimeout(() => {
                        props.callback()
                        form.resetFields()
                    }, 1000)
                } else {
                    throw res.msg
                }
            }).catch((e) => {
                // setLoading(false)
                message.error(e)
            }).finally(() => {
                setLoading(false)
            })
        })
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields()
    };
    useImperativeHandle(ref, () => ({
        showModal: (record?: editItems) => {
            setIsModalVisible(true)
            setEditRecordId(record?.id)
            if (record) {
                form.setFieldsValue({
                    vendor_sku: record.vendor_sku,
                    vendor_price: record.vendor_price,
                    availability: record.availability,
                    brand: record.brand || "",
                    vpn: record.vpn || "",
                    asin: record.asin || "",
                    newegg_id: record.newegg_id || ""
                })
            }
        }
    }));
    return (
        <>
            <Modal title={editRecordId ? 'edit' : 'add'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} confirmLoading={loading}>
                <Form
                    layout={"horizontal"}
                    form={form}
                >
                    <Form.Item label="Sku" name="vendor_sku" rules={[{ required: true }]}>
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="Price" name="vendor_price" rules={[{ required: true }]}>
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="Availability" name="availability" rules={[{ required: true }]}>
                        <InputNumber style={{ "width": "100%" }} placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="Brand" name="brand">
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="VPN" name="vpn">
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="ASIN" name="asin">
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="newegg_id" name="newegg_id">
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
});

type listingModelItem = {
    callback: () => void,
    ids: number[];
}

const ListingModel = React.forwardRef((props: listingModelItem, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false)
    const [storeInfo, setStoreInfo] = useState([])
    const [form] = Form.useForm();
    const handleOk = () => {
        form.validateFields().then(async ({ store_ids }) => {
            setLoading(true)
            const params: listingItem = {
                store_ids,
                ids: props.ids.toString()
            }
            listing(params).then(res => {
                if (res.code) {
                    message.success("Operation successful!")
                    setLoading(false)
                    setIsModalVisible(false);
                    setTimeout(() => {
                        props.callback()
                        form.resetFields()
                    }, 1000)
                } else {
                    throw res.msg
                }
            }).catch((e) => {
                message.error(e)
            }).finally(() => {
                setLoading(false)
            })
        })
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields()
    };
    const requestStore = async () => {
        const data = await stores()
        setStoreInfo(data)
    }
    useImperativeHandle(ref, () => ({
        showModal: () => {
            setIsModalVisible(true)
        }
    }));
    useEffect(() => {
        if (!stores.length) {
            requestStore()
        }
        return () => {

        }
    }, [])
    return (
        <>
            <Modal title={'Listing'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} confirmLoading={loading}>
                <Form
                    layout={"horizontal"}
                    form={form}
                >
                    <Form.Item label="Store" name="store_ids" rules={[{ required: true }]}>
                        <Select
                            style={{ width: '100%' }}
                            allowClear
                        >
                            {storeInfo.map((item: storeItem) => {
                                return (<Select.Option key={`${item.value}select`} value={item.value}>
                                    {item.label}
                                </Select.Option>)
                            })}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
});

export default () => {
    const actionRef: any = useRef<FormInstance>();
    const actionModelRef: any = useRef<any>();
    const listingModelRef: any = useRef<any>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const props: UploadProps = {
        name: 'name',
        action: `${API_URL}/pre_listing/import`,
        headers: {
            authorization: 'authorization-text',
            token: getToken()
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                actionRef.current.reload()
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const handleDelete = (id: number) => {
        del(id).then(res => {
            if (res.code) {
                message.success("successfully delete!")
                actionRef.current.reload();
            } else {
                throw res.msg
            }
        }).catch((e) => {
            message.error(e)
        })
    }

    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Product',
            search: false,
            dataIndex: 'name',
            render: (_, record) => {
                return <>
                    <Space direction="vertical">
                        <Text type="secondary">
                            SKU：<a
                                target="_blank"
                                rel="noreferrer"
                                href={``}
                            >
                                {record.vendor_sku}
                            </a>
                        </Text>
                        <Text type="secondary">
                            Newegg：
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={``}
                            >
                                <Text>{record.newegg_id}</Text>
                            </a>
                        </Text>
                        <Text type="secondary">
                            ASIN：
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href={``}
                            >
                                <Text>{record.asin}</Text>
                            </a>
                        </Text>
                        <Text type="secondary">
                            <span>VPN：</span>
                            <Text>{record.vpn}</Text>
                        </Text>
                        <Text type="secondary">
                            <span>Brand：</span>
                            <Text>{record.brand}</Text>
                        </Text>
                    </Space>
                </>
            },
        },
        {
            title: 'Time',
            dataIndex: 'Time',
            search: false,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type="secondary">
                        <span>update_time</span>：
                        <Text>{record.update_time}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>delete_time</span>：
                        <Text>{record.delete_time}</Text>
                    </Text>
                </Space>
            },
        },
        {
            title: 'VPN',
            dataIndex: 'VPN',
            hideInTable: true,
        },
        {
            title: 'Newegg',
            dataIndex: 'newegg_id',
            hideInTable: true,
        },
        {
            title: 'Asin',
            dataIndex: 'asin',
            copyable: true,
            hideInTable: true,
        },
        {
            title: 'SKU',
            dataIndex: 'vendor_sku',
            hideInTable: true,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            hideInTable: true,
        },
        {
            title: 'Availability',
            dataIndex: 'availability',
            align: 'center',
            valueType: 'digit',
        },
        {
            title: 'Store',
            dataIndex: 'Store',
            valueType: 'select',
            hideInTable: true,
            request: async () => {
                const data = await stores()
                return data
            }
        },
        {
            title: 'Store',
            search: false,
            dataIndex: 'store_names',
            render: (text) => {
                return text?.toString()
            }
        },
        {
            title: 'Price',
            dataIndex: 'vendor_price',
            align: 'center',
            search: false,
        },
        {
            title: 'Deleted state',
            dataIndex: 'is_delete',
            valueType: 'select',
            initialValue: '0',
            valueEnum: {
                0: { text: 'Not deleted', status: 'Success' },
                1: { text: 'deleted', status: 'Error' },
            },
        },
        {
            title: 'action',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (_, record) => [
                <a key="edit" onClick={() => {
                    actionModelRef.current.showModal(record)
                }}>Edit</a>,
                <Popconfirm key="del" title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
                    <a style={{ "color": "red" }}>Delete</a>
                </Popconfirm>,
            ],
        },
    ];

    return (<>
        <ProTable<TableListItem>
            rowSelection={{
                selectedRowKeys,
                onChange: (selectedRowKeys: any[]) => {
                    setSelectedRowKeys(selectedRowKeys);
                },
            }}
            columns={columns}
            actionRef={actionRef}
            request={async (params) =>
                // 表单搜索项会从 params 传入，传递给后端接口。
                // console.log(params, sorter, filter);
                new Promise((resolve) => {
                    const tempParams: any = {
                        ...params,
                        len: params.pageSize,
                        page: params.current
                    }
                    list(tempParams).then((res) => {
                        resolve({
                            data: res.data.data,
                            // success 请返回 true，
                            // 不然 table 会停止解析数据，即使有数据
                            success: !!res.code,
                            // 不传会使用 data 的长度，如果是分页一定要传
                            total: res.data.total,
                        });
                    });
                })
            }
            rowKey="id"
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                labelWidth: 'auto',
            }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Pre-listing"
            toolBarRender={() => [
                <Button
                    key="batch"
                    disabled={!selectedRowKeys.length}
                    onClick={() => {
                        listingModelRef.current.showModal()
                    }}
                >
                    Batch list
                </Button>,
                <Upload key='upload' {...props}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>,
                <Button key="primary" onClick={() => {
                    const url = `${API_URL}/example/vendor_import.csv`;
                    createDownload('test.csv', url);
                }}>
                    download the template
                </Button>,
                <Button key="add" type='primary' icon={<PlusOutlined />} onClick={() => {
                    actionModelRef.current.showModal()
                }}>Add</Button>
            ]}
        />
        <ActionModel ref={actionModelRef} callback={() => {
            actionRef.current.reload();
        }} />
        <ListingModel ref={listingModelRef} callback={() => {
            actionRef.current.reload();
        }} ids={selectedRowKeys} />
    </>);
};