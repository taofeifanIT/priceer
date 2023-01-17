import {
    getSkuList,
    getInfo,
    editAddress,
    getListingByAmazon,
    updateFnSku
} from '@/services/shipment';
import type { AddressItem } from '@/services/shipment';
import { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import {
    Button,
    Modal,
    Table,
    Form,
    InputNumber,
    Input,
    Popconfirm,
    Typography,
    message
} from 'antd';
import {
    SyncOutlined
} from '@ant-design/icons';
import 'antd/dist/antd.css';
import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import CreateShipmentModal from './CreateShipmentModal'

type listItem = {
    asin: string;
    ts_sku: string;
    fnsku: string;
    quantity: number;
    title: string;
    conditionType: string;
    productType: string;
    itemName: string;
    store_id: number;
    store_name: string;
    quantityForm?: number;
    quantityInCaseForm?: number;
    printQuantity?: number;
};



interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: AddressItem;
    index: number;
    children: React.ReactNode;
    required?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    required,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const Address = forwardRef((props: any, ref: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [data, setData] = useState<AddressItem[]>([]);
    const [editingKey, setEditingKey] = useState('');
    const isEditing = (record: AddressItem) => record.id + '' === editingKey;
    const edit = (record: Partial<AddressItem> & { id: React.Key }) => {
        form.setFieldsValue({ name: '', addressLine1: '', addressLine2: '', districtOrCounty: '', city: '', stateOrProvinceCode: '', countryCode: '', postalCode: '', ...record });
        setEditingKey(record.id + '');
    };
    const save = async (key: React.Key) => {
        try {
            const row = (await form.validateFields()) as AddressItem;

            const newData: AddressItem[] = [...data];
            const index = newData.findIndex(item => key === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                editAddress(newData[index]).then(res => {
                    if (res.code !== 0) {
                        setData(newData);
                        setEditingKey('');
                        message.success('Update success');
                    } else {
                        message.error('Update failed');
                        setEditingKey('');
                    }
                }).catch(err => {
                    message.error('Update failed');
                    setEditingKey('');
                })
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };
    const cancel = () => {
        setEditingKey('');
    };

    useImperativeHandle(ref, () => ({
        showModal: () => {
            showModal()
        }
    }));
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = [
        {
            title: 'name',
            dataIndex: 'name',
            width: '25%',
            editable: true,
        },
        {
            title: 'addressLine1',
            dataIndex: 'address_line1',
            width: '15%',
            editable: true,
        },
        {
            title: 'addressLine2',
            dataIndex: 'address_line2',
            width: '15%',
            editable: true,
            required: false,
        },
        {
            title: 'districtOrCounty',
            dataIndex: 'district_or_county',
            width: '15%',
            editable: true,
        },
        {
            title: 'city',
            dataIndex: 'city',
            width: '15%',
            editable: true,
        },
        {
            title: 'stateOrProvinceCode',
            dataIndex: 'state_or_province_code',
            width: '15%',
            editable: true,
        },
        {
            title: 'countryCode',
            dataIndex: 'country_code',
            width: '15%',
            editable: true,
        },
        {
            title: 'postalCode',
            dataIndex: 'postal_code',
            width: '15%',
            editable: true,
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_: any, record: AddressItem) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
                            Save
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <a>Cancel</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        Edit
                    </Typography.Link>
                );
            },
        },
    ];
    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: AddressItem) => ({
                record,
                inputType: col.dataIndex === 'age' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    useEffect(() => {
        if (isModalOpen) {
            getInfo().then((res) => {
                setData(res.data)
            })
        }
    }, [isModalOpen]);
    return (<Modal width={1200} title="Address manage" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                size='small'
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
            />
        </Form>
    </Modal>)
});

const RefreshFnku = (props: { sku: string, refresh: () => void }) => {
    const { sku, refresh } = props;
    const [loading, setLoading] = useState(false);
    const getFnsku = () => {
        setLoading(true);
        updateFnSku({ sku }).then(res => {
            if (res.code !== 0) {
                refresh();
            } else {
                message.error(JSON.stringify(res.msg));
            }
        }).catch(err => {
            message.error(JSON.stringify(err));
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        })
    };
    return (<a onClick={getFnsku}><SyncOutlined spin={loading} /></a>)
}


const ListTable = () => {
    const actionRef: any = useRef<FormInstance>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<listItem[]>([]);
    const [pullDataLoading, setPullDataLoading] = useState<boolean>(false);
    const createShipmentModal: any = useRef();
    const addressModal: any = useRef();
    const columns: ProColumns<listItem>[] = [
        {
            title: 'fn_sku',
            dataIndex: 'fnsku',
        },
        {
            title: 'conditionType',
            search: false,
            dataIndex: 'conditionType',
        },
        {
            title: 'Sku',
            dataIndex: 'vendor_sku',
            hideInTable: true,
        },
        {
            title: 'Sku',
            dataIndex: 'ts_sku',
            search: false,
        },
        {
            title: 'asin',
            dataIndex: 'asin',
        },
        {
            title: 'productType',
            dataIndex: 'productType',
        },
        {
            title: 'store_name',
            dataIndex: 'store_name',
            search: false,
        },
        {
            // action
            title: 'action',
            dataIndex: 'option',
            valueType: 'option',
            align: 'center',
            render: (_, record) => [
                <RefreshFnku sku={record.ts_sku} refresh={refresh} key={'RefreshFnku'} />
            ],
        }
    ];
    const pullDataFn = () => {
        setPullDataLoading(true);
        getListingByAmazon().then((res) => {
            if (res.code !== 0) {
                message.success("pull data success!");
                actionRef.current.reload();
            } else {
                message.error(res.msg);
            }
        }).finally(() => {
            setPullDataLoading(false);
        })
    }
    const refresh = () => {
        actionRef.current.reload();
    }
    return (<>
        <ProTable<listItem>
            rowSelection={{
                onChange: (_, selectedRows) => {
                    setSelectedRowKeys(selectedRows);
                },
                selectedRowKeys: selectedRowKeys.map((item) => item.ts_sku),
                preserveSelectedRowKeys: true,
            }}
            columns={columns}
            actionRef={actionRef}
            request={async (params = {}, sort, filter) => {
                const { data, code } = await getSkuList({
                    ...params,
                    page: params.current,
                    len: params.pageSize,
                });
                return {
                    data: data.data,
                    success: !!code,
                    total: data.total,
                };
            }}
            rowKey="ts_sku"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                pageSize: 10,
                pageSizeOptions: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
            }}
            dateFormatter="string"
            headerTitle="List"
            toolBarRender={() => [
                <Button type='primary' key={'address '} style={{ 'background': '#6e44d3' }} onClick={() => { addressModal.current.showModal() }}>Address</Button>,
                <Button loading={pullDataLoading} onClick={pullDataFn}>Pull data</Button>,
                <Button disabled={!selectedRowKeys.length} key="Createshipment" type="primary" onClick={() => {
                    createShipmentModal.current.showModal({ selectedRowKeys });
                }}>
                    Create shipment
                </Button>
            ]}
        />
        <CreateShipmentModal ref={createShipmentModal} />
        <Address ref={addressModal} />
    </>)
}




export default ListTable;
