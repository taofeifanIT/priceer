import { useRef } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { getList } from '@/services/odika/order'
import type { OrderListItem } from '@/services/odika/order';
import { AmazonOutlined } from '@ant-design/icons';
import { Typography, Space, Tag } from 'antd';
const { Text, Link, Paragraph } = Typography;

// 0：未自动下单    1:  自动下单成功    2：  自动下单失败    3：回填物流单成功   4： 手动下单
const autoOrderOtions = [
    { label: '未自动下单', value: 0 },
    { label: '自动下单成功', value: 1 },
    { label: '自动下单失败', value: 2 },
    { label: '回填物流单成功', value: 3 },
    { label: '手动下单', value: 4 },
]

export default () => {
    const actionRef: any = useRef<FormInstance>();
    const columns: ProColumns<OrderListItem>[] = [
        {
            title: 'Amazon Order ID',
            dataIndex: 'amazon_order_id',
            hideInTable: true,
        },
        {
            title: 'Order Item ID',
            dataIndex: 'order_item_id',
            hideInTable: true,
        },
        {
            title: 'SKU',
            dataIndex: 'seller_sku',
            hideInTable: true,
        },
        {
            title: 'ASIN',
            dataIndex: 'asin',
            hideInTable: true,
        },
        {
            title: 'Order Status',
            dataIndex: 'order_status',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                Unshipped: { text: 'Unshipped' },
                Shipped: { text: 'Shipped' },
                Canceled: { text: 'Canceled' },
            }
        },
        // auto_order
        {
            title: 'Operating Status',
            dataIndex: 'auto_order',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                0: { text: '未自动下单' },
                1: { text: '自动下单成功' },
                2: { text: '自动下单失败' },
                3: { text: '回填物流单成功' },
                4: { text: '手动下单' },
            }
        },
        {
            title: 'Marketplace',
            dataIndex: 'Marketplace',
            search: false,
            width: 355,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        <AmazonOutlined />Asin:
                        <Link href={`https://www.amazon.com/dp/${record.asin}`} target="_blank">{record.asin}</Link>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.asin }} />
                    </Text>
                    {/* sku */}
                    <Text type='secondary'>
                        SKU:
                        <Text>{record.seller_sku}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.seller_sku }} />
                    </Text>
                    {/* fnSku */}
                    <Text type='secondary'>
                        FnSku:
                        <Text>{record.fnsku}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.fnsku }} />
                    </Text>
                    <Text type='secondary'>
                        Amazon Order ID:
                        <Text>{record.amazon_order_id}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.amazon_order_id }} />
                    </Text>
                    <Text type='secondary'>
                        Order Item ID:
                        <Text>{record.order_item_id}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.order_item_id }} />
                    </Text>
                    <Text type="secondary">
                        Title: <Text
                            ellipsis={{ tooltip: record.title }}
                            style={{ width: 300 }}
                        >{record.title}</Text>
                    </Text>
                    {record.is_replacement_order === 1 && <Tag color="red">Replacement</Tag>}
                </Space>
            }
        },
        {
            // Pii
            title: 'Pii',
            dataIndex: 'Pii',
            search: false,
            width: 300,
            render: (_, record) => {
                return <Space direction="vertical">
                    {record.shipping_address.Name && <Text type='secondary'>
                        Name:
                        <Text>{record.shipping_address.Name}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.Name }} />
                    </Text>}
                    {record.shipping_address.AddressLine1 && <Text type='secondary'>
                        AddressLine1:
                        <Text>{record.shipping_address.AddressLine1}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.AddressLine1 }} />
                    </Text>}
                    {record.shipping_address.AddressLine2 && <Text type='secondary'>
                        AddressLine2:
                        <Text>{record.shipping_address.AddressLine2}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.AddressLine2 }} />
                    </Text>}
                    {record.shipping_address.PostalCode && <Text type='secondary'>
                        PostalCode:
                        <Text>{record.shipping_address.PostalCode}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.PostalCode }} />
                    </Text>}
                    {record.shipping_address.City && <Text type='secondary'>
                        City:
                        <Text>{record.shipping_address.City}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.City }} />
                    </Text>}
                    {record.shipping_address.StateOrRegion && <Text type='secondary'>
                        StateOrRegion:
                        <Text>{record.shipping_address.StateOrRegion}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.StateOrRegion }} />
                    </Text>}
                    {record.shipping_address.CountryCode && <Text type='secondary'>
                        CountryCode:
                        <Text>{record.shipping_address.CountryCode}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.CountryCode }} />
                    </Text>}
                    {record.shipping_address.Phone && <Text type='secondary'>
                        Phone:
                        <Text>{record.shipping_address.Phone}</Text>
                        <Paragraph style={{ display: 'inline' }} copyable={{ text: record.shipping_address.Phone }} />
                    </Text>}
                    <Text type='secondary'>
                        <Tag color="#2db7f5">{record.shipping_address.CountryCode}</Tag>
                    </Text>
                </Space>
            }
        },
        {
            // Price
            title: 'Price',
            dataIndex: 'Price',
            search: false,
            width: 185,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        Item Price Amount:
                        <Text>{record.item_price_amount}</Text>
                    </Text>
                    <Text type='secondary'>
                        Item Tax Amount:
                        <Text>{record.item_tax_amount}</Text>
                    </Text>
                    <Text type='secondary'>
                        Order Total Amount:
                        <Text>{record.order_total_amount}</Text>
                    </Text>
                </Space>
            }
        },
        {
            // Quantity
            title: 'Quantity',
            dataIndex: 'Quantity',
            search: false,
            width: 150,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        Quantity Ordered:
                        <Text>{record.quantity_ordered}</Text>
                    </Text>
                    <Text type='secondary'>
                        Quantity Shipped:
                        <Text>{record.quantity_shipped}</Text>
                    </Text>
                </Space>
            }
        },
        {
            // ACK
            title: 'ACK',
            dataIndex: 'ACK',
            search: false,
            width: 160,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        Reason:
                        <Text>{record.ack_reason}</Text>
                    </Text>
                    <Text type='secondary'>
                        Status:
                        <Text>{record.ack_status}</Text>
                    </Text>
                </Space>
            }
        },
        {
            // Status
            title: 'Status',
            dataIndex: 'Status',
            search: false,
            width: 240,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        Order Status:
                        <Text>{record.order_status}</Text>
                    </Text>
                    {/* Operating Stauts */}
                    <Text type='secondary'>
                        Operating Status:
                        <Text>{autoOrderOtions.find(item => item.value === record.auto_order)?.label}</Text>
                    </Text>
                    {record.is_cancel === 1 && (
                        <Text type='secondary'>
                            Cancel Reason:
                            <Text style={{ color: 'red' }}>{record.cancel_reason}</Text>
                        </Text>
                    )}
                </Space>
            }
        },
        {
            // Shipping
            title: 'Shipping',
            dataIndex: 'Shipping',
            search: false,
            width: 240,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        Shipping Method:
                        <Text>{record.shipping_method}</Text>
                    </Text>
                    <Text type='secondary'>
                        Shipping Fee:
                        <Text>{record.shipping_fee}</Text>
                    </Text>
                    <Text type='secondary'>
                        Shipping Currency:
                        <Text>{record.shipping_currency}</Text>
                    </Text>
                    <Text type='secondary'>
                        Shipping Tax Amount:
                        <Text>{record.shipping_tax_amount}</Text>
                    </Text>
                    <Text type='secondary'>
                        Shipping Tracking Number:
                        <Text>{record.shipping_tracking_number}</Text>
                    </Text>
                </Space>
            }
        },
        {
            // Warehouse
            title: 'Warehouse',
            dataIndex: 'Warehouse',
            search: false,
            width: 240,
            render: (_, record) => {
                return <Space direction="vertical">
                    <Text type='secondary'>
                        warehouse_name:
                        <Text>{record.warehouse_name}</Text>
                    </Text>
                    <Text type='secondary'>
                        Warehouse Code:
                        <Text>{record.warehouse_code}</Text>
                    </Text>
                    <Text type='secondary'>
                        Warehouse Order Code:
                        <Text>{record.warehouse_order_code}</Text>
                    </Text>
                </Space>
            }
        },
    ];

    return (<>
        <ProTable<OrderListItem>
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
            scroll={{ y: columns.reduce((total, item) => total + (item.width || 0), 0) > 1000 ? 1000 : undefined }}
            bordered
            dateFormatter="string"
            headerTitle="OdiKa Order List"
        />
    </>);
};