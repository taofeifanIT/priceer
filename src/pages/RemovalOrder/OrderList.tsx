import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { getList } from '@/services/removalOrder'

export type TableListItem = {
    id: number,
    store_id: number,
    ns_id: number,
    order_id: string,
    order_type: string,
    order_status: string,
    sku: string,
    msku: string,
    fnsku: string,
    dispostion: string
    request_date: string;
    last_updated_date: string,
    requested_quantity: number,
    cancelled_quantity: number,
    disposed_quantity: number,
    shipped_quantity: number,
    in_process_quantity: number,
    removal_fee: string,
    currency: string,
    request_date_timestamp: number,
    last_updated_date_timestamp: number,
    store_name: string
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
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'MSKU',
            dataIndex: 'msku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            align: 'center',
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
            title: 'Disposition',
            dataIndex: 'disposition',
            align: 'center',
            valueType: 'text',
            valueEnum: {
                Sellable: { text: 'Sellable' },
                Unsellable: { text: 'Unsellable' }
            }
        },
        {
            title: 'Requested Quantity',
            dataIndex: 'requested_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Cancelled Quantity',
            dataIndex: 'cancelled_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Disposed Quantity',
            dataIndex: 'disposed_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Shipped Quantity',
            dataIndex: 'shipped_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'In Process QUantity',
            dataIndex: 'in_process_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Request Date',
            dataIndex: 'request_date',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Removal Fee',
            dataIndex: 'removal_fee',
            align: 'center',
            search: false,
            render: (_, record) => {
                return `${record.removal_fee}` != '0.0000' ? `$${record.removal_fee}` : '-'
            },
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            align: 'center',
            valueType: 'text',
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
                    let tempParams: any = {
                        ...params,
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
            headerTitle="Removal Order List"
            toolBarRender={() => []}
        />
    </>);
};

// export default connect(({ globalparams }: any) => ({ globalparams }))(ListedProduct); 