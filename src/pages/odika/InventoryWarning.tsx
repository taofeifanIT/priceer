import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { sku } from '@/services/odika/inventoryWarning';
import { Tooltip } from 'antd';

export default () => {
    const actionRef = useRef<ActionType>();
    const columns: ProColumns<any>[] = [
        // "fba_qty": 202,
        // 		"pj_la_qty": 172,
        // 		"wyd_la_qty": null,
        // 		"wyd_atl_qty": 100,
        {
            title: 'SKU',
            dataIndex: 'sku',
            ellipsis: true,
            align: 'center'
        },
        {
            title: 'Shopify QTY',
            dataIndex: 'shopify',
            ellipsis: true,
            align: 'center'
        },
        {
            title: 'Amazon',
            children: [
                {
                    title: 'FBA QTY',
                    dataIndex: 'amazon_fba_qty',
                    ellipsis: true,
                    align: 'center',
                    render: (text, record) => {
                        return <Tooltip title={record?.amazon_fba_sku}>
                            <span>{text}</span>
                        </Tooltip>
                    }
                },
                {
                    title: 'FBM QTY',
                    dataIndex: 'amazon_fbm_qty',
                    ellipsis: true,
                    align: 'center',
                    render: (text, record) => {
                        return <Tooltip title={record?.amazon_fbm_sku}>
                            <span>{text}</span>
                        </Tooltip>
                    }
                },
            ]
        },
        {
            title: 'QTY',
            children: [
                {
                    title: 'FBA',
                    dataIndex: 'fba_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'Warehouse Total',
                    dataIndex: 'wareHouseTotal',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'PJ LA(NS)',
                    dataIndex: 'pj_la_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'PJ LA(Warehouse)',
                    dataIndex: 'warehouse_pj_la_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'WYD LA(NS)',
                    dataIndex: 'wyd_la_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'WYD LA(Warehouse)',
                    dataIndex: 'warehouse_wyd_la_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'WYD ATL(NS)',
                    dataIndex: 'wyd_atl_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'WYD ATL(Warehouse)',
                    dataIndex: 'warehouse_wyd_atl_qty',
                    ellipsis: true,
                    align: 'center'
                }
            ]
        },
    ];
    return (<>
        <ProTable<any>
            size='small'
            columns={columns}
            actionRef={actionRef}
            bordered
            request={async (params = {}, _sort, filter) => {
                const tempParams = { ...params, ...filter, len: params.pageSize, page: params.current }
                const res = await sku(tempParams)
                const { data, code } = res
                // "warehouse_pj_la_qty": null,
                // "warehouse_wyd_la_qty": null,
                // "warehouse_wyd_atl_qty": 100,
                const tempData = data.data.map((item: any) => {
                    return {
                        ...item,
                        wareHouseTotal: (item.warehouse_pj_la_qty || 0) + (item.warehouse_wyd_la_qty || 0) + (item.warehouse_wyd_atl_qty || 0)
                    }
                })
                return {
                    data: tempData,
                    success: !!code,
                    total: data.total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 260, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
            rowKey="id"
            // search={{
            //     labelWidth: 'auto',
            // }}
            search={false}
            pagination={{
                defaultPageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                showSizeChanger: true
                // onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
        />
    </>);
};