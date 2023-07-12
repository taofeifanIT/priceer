import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { getShipmentList } from '@/services/removalOrder'
import type { TableListItem } from '@/services/removalOrder'
import Dayjs from 'dayjs';




const checkProgress = (check_status: number): any => {
    let text = 'not yet'
    switch (check_status) {
        case 1:
            text = 'Pending Delivery'
            break;
        case 2:
            text = 'Waiting Receive'
            break;
        case 3:
            text = 'Need to Finish'
            break;
        case 4:
            text = 'Need to Claim'
            break;
        case 5:
            text = 'Done'
            break;
    }
    return text
}

export default () => {
    const actionRef: any = useRef<FormInstance>();
    const columns: ProColumns<TableListItem>[] = [
        {
            // 进度
            title: 'Progress',
            dataIndex: 'check_status',
            align: 'center',
            width: 90,
            search: false,
            render: (_, record) => {
                return (
                    <div>
                        {checkProgress(record.check_status)}
                    </div>
                )
            }
        },
        {
            // request_date_timestamp
            title: 'Request Date',
            dataIndex: 'request_date_timestamp',
            align: 'center',
            width: 80,
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
            width: 65,
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            search: false,
            width: 80,
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku_total',
            align: 'center',
            valueType: 'text',
            search: false,
            width: 40,
        },
        {
            title: 'Shipped-Quantity',
            dataIndex: 'shipped_quantity',
            align: 'center',
            valueType: 'digit',
            width: 100,
            search: false,
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date_timestamp',
            align: 'center',
            valueType: 'dateRange',
            width: 100,
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
            width: 150,
            // ellipsis: true,
        },
        {
            // Progress
            title: 'Progress',
            dataIndex: 'check_status',
            align: 'center',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                1: { text: 'Pending Delivery', status: 'Processing' },
                2: { text: 'Waiting Receive', status: 'Processing' },
                3: { text: 'Need to Finish', status: 'Processing' },
                4: { text: 'Need to Claim', status: 'Processing' },
                5: { text: 'Done', status: 'Success' },
            },
        },
        {
            title: 'Status',
            dataIndex: 'tracking_last_status',
            search: false,
            width: 130,
            valueType: 'text',
        },
        {
            title: 'PO',
            dataIndex: 'po',
            width: 60,
            search: false,
        },
        {
            title: 'Action',
            width: 65,
            key: 'option',
            align: 'center',
            fixed: 'right',
            valueType: 'option',
            render: (_, record) => {
                if (record.check_status === 2 && record.po_id !== 0) {
                    return <Button type="primary" size='small' key="checked" onClick={() => {
                        window.open(`/RemovalOrder/Checked?tracking_number=${record.tracking_number}`)
                    }}>Checked</Button>
                } else if (record.check_status === 4 || record.check_status === 5) {
                    // view  use a tag
                    return <a href={`/RemovalOrder/Checked?tracking_number=${record.tracking_number}&view=true`} target="_blank" rel="noopener noreferrer">View</a>
                }
            },
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