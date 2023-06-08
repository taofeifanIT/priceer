import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { getShipmentList } from '@/services/removalOrder'
import type { TableListItem } from '@/services/removalOrder'
import Dayjs from 'dayjs';




const checkProgress = (progress: number, tracking_status: string, shipped_quantity: number): any => {
    let text = ''
    let color = ''
    if (tracking_status !== 'IN_TRANSIT') {
        if (progress === shipped_quantity) {
            text = 'Full Received'
            color = 'green'
        } else if (progress > 0 && progress < shipped_quantity) {
            text = 'Partial receipt'
            color = '#faad14'
        }
        // 如果shipment_status是pending就没有颜色
        if (tracking_status === 'PENDING') {
            color = ''
        }
        return <span style={{ 'color': color }}>{text}</span>
    } else {
        return null
    }

}


export default () => {
    const actionRef: any = useRef<FormInstance>();
    const columns: ProColumns<TableListItem>[] = [
        {
            // 进度
            title: 'Progress',
            dataIndex: 'progress',
            align: 'center',
            width: 120,
            search: false,
            render: (_, record) => checkProgress(record.progress || 0, record.tracking_status, record.shipped_quantity)
        },
        {
            // request_date_timestamp
            title: 'Request Date',
            dataIndex: 'request_date_timestamp',
            align: 'center',
            width: 120,
            search: false,
            render: (_, record) => {
                return (
                    <span>{Dayjs(record.request_date_timestamp * 1000).format('YYYY-MM-DD')}</span>
                )
            }
        },
        {
            title: 'Store Name',
            dataIndex: 'store_name',
            align: 'center',
            valueType: 'text',
            width: 100,
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
            search: false,
            width: 140,
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku_total',
            align: 'center',
            valueType: 'text',
            search: false,
            width: 80,
        },
        {
            title: 'Shipped-Quantity',
            dataIndex: 'shipped_quantity',
            align: 'center',
            valueType: 'digit',
            width: 180,
            search: false,
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date_timestamp',
            align: 'center',
            valueType: 'dateRange',
            width: 180,
            render(_, record) {
                return (
                    <div>
                        {Dayjs(record.shipment_date_timestamp * 1000).format('YYYY-MM-DD')}
                    </div>
                );
            },
        },
        {
            title: 'Tracking',
            dataIndex: 'tracking_number',
            valueType: 'text',
            align: 'center',
            width: 140,
        },
        {
            title: 'Status',
            dataIndex: 'tracking_last_status',
            align: 'center',
            search: false,
            width: 100,
            valueType: 'text',
        },
        {
            title: 'action',
            width: 100,
            key: 'option',
            align: 'center',
            fixed: 'right',
            valueType: 'option',
            render: (_, record) => [
                <Button type="primary" size='small' key="checked" disabled={record.progress === record.shipped_quantity} onClick={() => {
                    window.open(`/RemovalOrder/Checked?tracking_number=${record.tracking_number}`)
                }}>Checked</Button>
            ],
        },
    ];
    return (<>
        <ProTable<TableListItem>
            columns={columns}
            actionRef={actionRef}
            request={async (params) =>
                // 表单搜索项会从 params 传入，传递给后端接口。
                // console.log(params, sorter, filter);
                new Promise((resolve) => {
                    const tempParams: any = {
                        ...params,
                        start_date: params.shipment_date_timestamp ? params.shipment_date_timestamp[0] : undefined,
                        end_date: params.shipment_date_timestamp ? params.shipment_date_timestamp[1] : undefined,
                        len: params.pageSize,
                        page: params.current
                    }
                    getShipmentList(tempParams).then((res) => {
                        resolve({
                            data: res.data.data,
                            success: !!res.code,
                            total: res.data.total,
                        });
                    });
                })
            }
            rowKey="tracking_number"
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                labelWidth: 'auto',
            }}
            scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0) }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Shipment Detail"
            toolBarRender={() => []}
        />
    </>);
};