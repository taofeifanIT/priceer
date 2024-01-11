import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { sku } from '@/services/odika/inventoryWarning';
import { Tooltip, Button } from 'antd';
import ReactHTMLTableToExcel from 'react-html-table-to-excel'

export default () => {
    const actionRef = useRef<ActionType>();
    const [exportData, setExportData] = useState([])
    const [exportLoaing, setExportLoading] = useState(false)
    const columns: ProColumns<any>[] = [
        // "fba_qty": 202,
        // 		"pj_la_qty": 172,
        // 		"wyd_la_qty": null,
        // 		"wyd_atl_qty": 100,
        {
            title: 'SKU',
            dataIndex: 'sku',
            ellipsis: true,
            copyable: true,
            width: 180,
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
                    title: 'FBA(NS)',
                    dataIndex: 'fba_qty',
                    ellipsis: true,
                    align: 'center'
                },
                {
                    title: 'WH TOTAL',
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
                    title: 'PJ LA(WH)',
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
                    title: 'WYD LA(WH)',
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
                    title: 'WYD ATL(WH)',
                    dataIndex: 'warehouse_wyd_atl_qty',
                    ellipsis: true,
                    align: 'center'
                }
            ]
        },
    ];

    const getAlldata = () => {
        const page = 1
        const len = 1000
        const tempParams = { len, page }
        setExportLoading(true)
        sku(tempParams).then(res => {
            const { data, code } = res
            if (code) {
                const tempData = data.data.map((item: any) => {
                    return {
                        ...item,
                        wareHouseTotal: (item.warehouse_pj_la_qty || 0) + (item.warehouse_wyd_la_qty || 0) + (item.warehouse_wyd_atl_qty || 0)
                    }
                })
                setExportData(tempData)
            }
        }).finally(() => {
            setExportLoading(false)
            setTimeout(() => {
                document.getElementById('test-table-xls-button3')?.click()
            });
        })
    }
    return (<>
        <div style={{ display: 'none' }}>
            <ReactHTMLTableToExcel
                id="test-table-xls-button3"
                className="ant-btn ant-btn-default"
                table="customsDeclaration"
                filename="Inventory_data"
                sheet="tablexls"
                format="xlsx"
                buttonText="Customs Declaration Excel" />
        </div>
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
            toolBarRender={() => [
                <Button key="3" type="primary" onClick={getAlldata} loading={exportLoaing}>
                    Export
                </Button>,
            ]}
        />
        <table id="customsDeclaration" style={{ display: 'none' }} border="1">
            <thead>
                {/* 和ant 的table格式一样 */}
                <tr>
                    <th rowSpan={2}>SKU</th>
                    <th rowSpan={2}>Shopify QTY</th>
                    <th colSpan={2}>Amazon</th>
                    <th colSpan={8}>QTY</th>
                </tr>
                <tr>
                    <th>FBA QTY</th>
                    <th>FBM QTY</th>
                    <th>FBA(NS)</th>
                    <th>WH TOTAL</th>
                    <th>PJ LA(NS)</th>
                    <th>PJ LA(WH)</th>
                    <th>WYD LA(NS)</th>
                    <th>WYD LA(WH)</th>
                    <th>WYD ATL(NS)</th>
                    <th>WYD ATL(WH)</th>
                </tr>
            </thead>
            <tbody>
                {
                    exportData.map((item: any) => {
                        return <tr key={item.id}>
                            <td>{item.sku}</td>
                            <td>{item.shopify}</td>
                            <td>{item.amazon_fba_qty}</td>
                            <td>{item.amazon_fbm_qty}</td>
                            <td>{item.fba_qty}</td>
                            <td>{item.wareHouseTotal}</td>
                            <td>{item.pj_la_qty}</td>
                            <td>{item.warehouse_pj_la_qty}</td>
                            <td>{item.wyd_la_qty}</td>
                            <td>{item.warehouse_wyd_la_qty}</td>
                            <td>{item.wyd_atl_qty}</td>
                            <td>{item.warehouse_wyd_atl_qty}</td>
                        </tr>
                    })
                }
            </tbody>
        </table>
    </>);
};