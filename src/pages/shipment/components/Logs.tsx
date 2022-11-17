import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { getList } from '@/services/shipment'
import CreateShipmentModal from './CreateShipmentModal'

type GithubIssueItem = {
    url: string;
    id: number;
    number: number;
    title: string;
    labels: {
        name: string;
        color: string;
    }[];
    state: string;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at?: string;
};


export default () => {
    const actionRef = useRef<ActionType>();
    const [allParams, setAllParams] = useState<{
        selectedRowKeys: any[], shipment_id?: string, addressInfo?: any, formData?: any[]
    }>({ selectedRowKeys: [], shipment_id: '', addressInfo: {}, formData: [] });
    const createShipmentModal: any = useRef();

    const columns: ProColumns<any>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'Shipment ID',
            dataIndex: 'shipment_id',
            copyable: true,
            ellipsis: true,
        },
        {
            disable: true,
            title: 'TransportStatus',
            dataIndex: 'transport_status',
            filters: true,
            onFilter: true,
            ellipsis: true,
            valueType: 'select',
            valueEnum: {
                Shiped: {
                    text: 'Shiped',
                    status: 'Success',
                },
                WORKING: {
                    text: 'WORKING',
                    status: 'Processing',
                },
                ESTIMATING: {
                    text: 'ESTIMATING',
                    status: 'Processing',
                },
                ESTIMATED: {
                    text: 'ESTIMATED',
                    status: 'Processing',
                },
                CONFIRMING: {
                    text: 'CONFIRMING',
                    status: 'Processing',
                },
                ERROR_ON_ESTIMATING: {
                    text: 'ERROR_ON_ESTIMATING',
                    status: 'Error',
                },
                ERROR: {
                    text: 'ERROR',
                    status: 'Error',
                },
            },
        },
        {
            disable: true,
            title: 'RequestLogs',
            dataIndex: 'log',
            search: false,
            render: (_, record) => {
                return (<a>{record.log.length}</a>)
            }
        },
        {
            title: 'created_at',
            key: 'showTime',
            dataIndex: 'created_at',
            search: false,
        },
        {
            title: 'Memo',
            dataIndex: 'memo',
            search: false,
        },
        {
            title: 'option',
            valueType: 'option',
            key: 'option',
            render: (text, record) => [
                <a
                    key="editable"
                    onClick={() => {
                        const { goods, shipment_id, address, form_data } = record
                        let tempParams = {
                            selectedRowKeys: goods.map((item: any) => {
                                return {
                                    ...item,
                                    quantityForm: item.quantity,
                                }
                            }),
                            shipment_id,
                            addressInfo: address,
                            formData: {
                                ...form_data,
                                packages: form_data.items
                            }
                        }
                        setAllParams(tempParams)
                        createShipmentModal.current.showModal(tempParams)
                    }}
                >
                    Edit
                </a>
            ],
        },
    ];
    return (<>
        <ProTable<GithubIssueItem>
            columns={columns}
            actionRef={actionRef}
            request={async (params = {}, sort, filter) => {
                const { data, code } = await getList({
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
            editable={{
                type: 'multiple',
            }}
            columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
                onChange(value) {
                    console.log('value: ', value);
                },
            }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            form={{
                // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                syncToUrl: (values, type) => {
                    if (type === 'get') {
                        return {
                            ...values,
                            created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            pagination={{
                pageSize: 20,
                onChange: (page) => console.log(page),
            }}
            dateFormatter="string"
        />
        <CreateShipmentModal {...allParams} ref={createShipmentModal} />
    </>);
};