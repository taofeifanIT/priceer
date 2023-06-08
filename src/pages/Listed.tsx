import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Space, Typography } from 'antd';
import { listing } from '@/services/listed'
import { stores } from '@/services/basePop'
import moment from 'moment';

const { Text } = Typography;


export type TableListItem = {
    id: number,
    asin: string,
    store_price_now: number,
    listing_to_store_quantity: number,
    listing_status: number,
    marketplace_id: number,
    company_id: number,
    country_id: number,
    store_id: number,
    vendor_sku: string
    vendor_price: string;
    vendor_quantity: number,
    vpn: string,
    upc: string,
    newegg_id: number,
    buybox_info: string,
    buybox_price: string,
    buybox_time: number,
    batch_id: string,
    is_delete: number,
    add_admin_id: number,
    add_time: number,
    operate_time: number,
    task_update_at: number,
    update_at: number,
    price_and_quantity_change_time: number,
    source: number
};




export default () => {
    const actionRef: any = useRef<FormInstance>();
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
                    </Space>
                </>
            },
        },
        {
            title: 'Price',
            dataIndex: 'vendor_price',
            search: false,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type="secondary">
                        <span>Price</span>：
                        <Text>{record.vendor_price}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>Store price now</span>：
                        <Text>{record.store_price_now}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>Buybox price</span>：
                        <Text>{record.buybox_price}</Text>
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
            title: 'Quantity',
            dataIndex: 'vendor_quantity',
            align: 'center',
            valueType: 'digit',
        },
        {
            title: 'Store',
            dataIndex: 'store_id',
            valueType: 'select',
            request: async () => {
                const data = await stores()
                return data
            }
        },
        {
            title: 'Time',
            dataIndex: 'Time',
            search: false,
            render: (_, record) => {
                const { add_time, operate_time, update_at, price_and_quantity_change_time } = record
                return <Space direction="vertical">
                    <Text type="secondary">
                        <span>add_time</span>：
                        <Text>{add_time ? moment(add_time * 1000).format('YYYY-MM-DD HH:mm:ss') : 'Not yet'}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>operate_time</span>：
                        <Text>{operate_time ? moment(operate_time * 1000).format('YYYY-MM-DD HH:mm:ss') : 'Not yet'}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>update_at</span>：
                        <Text>{update_at ? moment(update_at * 1000).format('YYYY-MM-DD HH:mm:ss') : 'Not yet'}</Text>
                    </Text>
                    <Text type="secondary">
                        <span>price_quantity_change_time</span>：
                        <Text>{price_and_quantity_change_time ? moment(price_and_quantity_change_time * 1000).format('YYYY-MM-DD HH:mm:ss') : 'Not yet'}</Text>
                    </Text>
                </Space>
            },
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
                        len: params.pageSize,
                        page: params.current
                    }
                    listing(tempParams).then((res) => {
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
            headerTitle="Listed Product"
            toolBarRender={() => []}
        />
    </>);
};

// export default connect(({ globalparams }: any) => ({ globalparams }))(ListedProduct); 