import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { getList, deleteShipment, getLog } from '@/services/shipment'
import { Modal, Spin, message } from 'antd'
import CreateShipmentModal from './CreateShipmentModal'
import Delete from '@/components/Delete'

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


const ShowResponse = forwardRef((_: any, ref: any) => {
    const [visible, setVisible] = useState(false)
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState(false)
    useImperativeHandle(ref, () => ({
        show: (shipment_id: any) => {
            setVisible(true)
            setLoading(true)
            getLog({ shipment_id }).then(res => {
                if (res.code) {
                    setData(res.data)
                } else {
                    throw res.msg
                }
            }).catch(e => {
                message.error(e)
            }).finally(() => {
                setLoading(false)
            })
        }
    }))
    const handleCancel = () => {
        setVisible(false)
        setData([])
    }
    return (<Modal
        title="Response log"
        width={1000}
        visible={visible}
        onCancel={handleCancel}
        onOk={handleCancel}>
        <Spin spinning={loading}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </Spin>
    </Modal>)
})

export default () => {
    const actionRef = useRef<ActionType>();
    const [allParams, setAllParams] = useState<{
        selectedRowKeys: any[], shipment_id?: string, addressForm?: any, formData?: any[]
    }>({ selectedRowKeys: [], shipment_id: '', addressForm: {}, formData: [] });
    const createShipmentModal: any = useRef();
    const showResponse: any = useRef();

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
            dataIndex: 'log_num',
            search: false,
            render: (text, record) => {
                return (<a onClick={() => {
                    showResponse.current.show(record.shipment_id)
                }}>{text}</a>)
            }
        },
        {
            title: 'created_at',
            key: 'showTime',
            dataIndex: 'created_at',
            ellipsis: true,
            search: false,
        },
        {
            title: 'Memo',
            dataIndex: 'memo',
            ellipsis: true,
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
                        const { goods, shipment_id, address, form_data, ship_to_address } = record
                        const tempParams = {
                            selectedRowKeys: goods.map((item: any) => {
                                return {
                                    ...item,
                                    quantityForm: item.quantity,
                                }
                            }),
                            shipment_id,
                            addressForm: address,
                            formData: {
                                ...form_data,
                                packages: form_data.items
                            },
                            ship_to_address
                        }
                        setAllParams(tempParams)
                        createShipmentModal.current.showModal(tempParams)
                    }}
                >
                    Edit
                </a>,
                <Delete key={'delete'} params={{ shipment_id: record.shipment_id }} api={deleteShipment} initData={() => actionRef.current?.reload()} />
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
                            // created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            pagination={{
                pageSize: 20,
                // onChange: (page) => console.log(page),
            }}
            dateFormatter="string"
        />
        <CreateShipmentModal {...allParams} ref={createShipmentModal} initData={() => { actionRef.current?.reload() }} />
        <ShowResponse ref={showResponse} />
    </>);
};