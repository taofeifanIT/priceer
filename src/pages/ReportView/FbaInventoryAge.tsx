import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getFbaInventoryAge } from '@/services/reportView'
import { useModel } from 'umi';

type GithubIssueItem = {
    id: number;
    store_id: number;
    current_date: string;
    asin: string;
    msku: string;
    product_name: string;
    condition: string;
    available: number;
    pending_removal_quantity: number;
    price: string;
    lowest_price_used: string;
    inv_age_0_to_30_days: number;
    inv_age_31_to_60_days: number;
    inv_age_61_to_90_days: number;
    inv_age_181_to_330_days: number;
    inv_age_331_to_365_days: number;
    inbound_quantity: number;
    inbound_working: number;
    inbound_shipped: number;
    inbound_received: number;
};



export default () => {
    const actionRef = useRef<ActionType>();
    const { initialState } = useModel('@@initialState');
    const { configInfo } = initialState || {};
    const getStores = () => {
        const storeObj: any = {}
        configInfo?.dash_store.forEach((item: any) => {
            storeObj[item.id] = {
                text: item.name
            }
        })
        return storeObj
    }
    const columns: ProColumns<GithubIssueItem>[] = [

        {
            title: 'ASIN',
            dataIndex: 'asin',
            width: 120,
            search: false,
            fixed: 'left',
        },
        {
            title: 'Store Name',
            dataIndex: 'store_id',
            width: 120,
            valueType: 'select',
            valueEnum: getStores(),
        },
        {
            title: 'Current Date',
            dataIndex: 'current_date',
            width: 120,
            search: false,
        },
        {
            title: 'MSKU',
            dataIndex: 'msku',
            width: 180,
            ellipsis: true,
            search: false,
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            width: 320,
            ellipsis: true,
            search: false,
        },
        {
            title: 'Condition',
            dataIndex: 'condition',
            width: 100,
            search: false,
        },
        {
            title: 'Available',
            dataIndex: 'available',
            width: 80,
            search: false,
        },
        {
            title: 'Pending Removal Quantity',
            dataIndex: 'pending_removal_quantity',
            width: 200,
            search: false,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            width: 72,
            search: false,
        },
        {
            title: 'Lowest Price Used',
            dataIndex: 'lowest_price_used',
            width: 150,
            search: false,
        },
        {
            title: 'Inv Age 0 to 30 Days',
            dataIndex: 'inv_age_0_to_30_days',
            width: 155,
            search: false,
        },
        {
            title: 'Inv Age 31 to 60 Days',
            dataIndex: 'inv_age_31_to_60_days',
            width: 164,
            search: false,
        },
        {
            title: 'Inv Age 61 to 90 Days',
            dataIndex: 'inv_age_61_to_90_days',
            width: 164,
            search: false,
        },
        {
            title: 'Inv Age 181 to 330 Days',
            dataIndex: 'inv_age_181_to_330_days',
            width: 179,
            search: false,
        },
        {
            title: 'Inv Age 331 to 365 Days',
            dataIndex: 'inv_age_331_to_365_days',
            width: 179,
            search: false,
        },
        {
            title: 'Inbound Quantity',
            dataIndex: 'inbound_quantity',
            width: 135,
            search: false,
        },
        {
            title: 'Inbound Working',
            dataIndex: 'inbound_working',
            width: 135,
            search: false,
        },
        {
            title: 'Inbound Shipped',
            dataIndex: 'inbound_shipped',
            width: 135,
            search: false,
        },
        {
            title: 'Inbound Received',
            dataIndex: 'inbound_received',
            width: 135,
            search: false,
        }
    ];
    // 计算页面最合适的数量条数
    const calcTableHeight = () => {
        // 获取页面高度
        const clientHeight = document.body.clientHeight - 64 - 24 - 46 - 46 - 46 - 24 - 24
        // 获取表格头部高度
        const tableHeaderHeight = 47
        const pageSize = Math.floor((clientHeight - tableHeaderHeight) / 47)
        return pageSize
    }
    return (
        <ProTable<GithubIssueItem>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}) =>
                new Promise((resolve) => {
                    const tempParams: any = {
                        ...params,
                        len: params.pageSize,
                        page: params.current
                    }
                    getFbaInventoryAge(tempParams).then((res) => {
                        resolve({
                            data: res.data,
                            success: !!res.code,
                            total: res.data.length,
                        });
                    });
                })
            }
            editable={{
                type: 'multiple',
            }}
            // columnsState={{
            //     persistenceKey: 'pro-table-singe-demos',
            //     persistenceType: 'localStorage',
            //     onChange(value) {
            //         console.log('value: ', value);
            //     },
            // }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            options={{
                // setting: {
                //     listsHeight: 400,
                // },
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
                pageSize: calcTableHeight(),
                pageSizeOptions: ['10', '15', '20', '30', '50', '100'],
                onChange: (page) => console.log(page),
            }}
            scroll={{ x: columns.reduce((total, { width = 0 }) => total + width, 0) }}
            dateFormatter="string"
            headerTitle="FbaInventoryAge Report"
        />
    );
};