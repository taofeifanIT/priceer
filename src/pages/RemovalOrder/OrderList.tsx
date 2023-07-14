import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { getList } from '@/services/removalOrder'
import moment from 'moment';

export type TableListItem = {
    store_name: string;
    order_id: string;
    order_type: string;
    request_date_timestamp: number;
    order_status: string;
    requested_quantity: string;
    shipped_quantity: string;
    cancelled_quantity: string;
    in_process_quantity: string;
}


export default () => {
    const actionRef: any = useRef<FormInstance>();
    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Store Name',
            dataIndex: 'store_name',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Request Date',
            dataIndex: 'request_date_timestamp',
            align: 'center',
            valueType: 'dateRange',
            render: (_, record) => {
                return (
                    <span>{moment(record.request_date_timestamp * 1000).format('YYYY-MM-DD')}</span>
                )
            }
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
            copyable: true,
            valueType: 'text',
        },
        {
            title: 'Order Type',
            dataIndex: 'order_type',
            align: 'center',
            valueType: 'select',
            valueEnum: {
                Return: { text: 'Return' },
                Disposal: { text: 'Disposal' },
                Liquidate: { text: 'Liquidate' },
            },
        },
        {
            title: 'Order Status',
            dataIndex: 'order_status',
            align: 'center',
            valueType: 'text',
            valueEnum: {
                Pending: { text: 'Pending' },
                Delivered: { text: 'Delivered' },
                Completed: { text: 'Completed' },
                Cancelled: { text: 'Cancelled' },
            },
        },
        {
            title: 'Requested QTY',
            dataIndex: 'requested_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Completed QTY',
            dataIndex: 'shipped_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Cancelled QTY',
            dataIndex: 'cancelled_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'In Process QTY',
            dataIndex: 'in_process_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        }
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
                        start_date: params.request_date_timestamp ? params.request_date_timestamp[0] : undefined,
                        end_date: params.request_date_timestamp ? params.request_date_timestamp[1] : undefined,
                        len: params.pageSize,
                        page: params.current
                    }
                    getList(tempParams).then((res) => {
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
            rowKey="order_id"
            pagination={{
                showQuickJumper: true,
            }}
            scroll={{ x: columns.reduce((total, item) => total + Number(item.width || 0), 0) }}
            search={{
                labelWidth: 'auto',
            }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Order Detail"
            toolBarRender={() => []}
        />
    </>);
};

// export default connect(({ globalparams }: any) => ({ globalparams }))(ListedProduct); 