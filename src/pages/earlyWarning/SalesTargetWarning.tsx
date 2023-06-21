import type { DatePickerProps } from 'antd';
import { message } from 'antd';
import { getSalesTargetList } from '@/services/earlyWarning'
import type { SalesTargetListParams } from '@/services/earlyWarning'
import type { SalesTargetItem } from '@/services/earlyWarning'
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useModel } from 'umi';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';

export default () => {
    const [date, setDate] = useState<DatePickerProps['value']>(null)
    const [salesTile, setSalesTile] = useState<string>('Daily Sales')
    const { initialState } = useModel('@@initialState');
    const { configInfo } = initialState || {};
    console.log(configInfo)
    const getDailySituation = (record: SalesTargetItem, salesTarget: number) => {
        let difference = 0
        if (!date) {
            // 判断本月有多少天
            const days = dayjs().daysInMonth()
            const averageSales = salesTarget / days
            difference = record.daily_sales - averageSales
        } else {
            const days = dayjs(date[1]).diff(dayjs(date[0]), 'day')
            const dayNums = dayjs().daysInMonth()
            const averageSales = salesTarget / dayNums
            const exceptSales = averageSales * days
            difference = record.daily_sales - exceptSales
        }
        return difference
    }
    const columns: ProColumns<SalesTargetItem> = [
        {
            title: 'Date',
            dataIndex: 'date',
            valueType: 'dateRange',
            hideInTable: true,
        },
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            search: false,
        },
        {
            title: 'Asin',
            dataIndex: 'asin',
            key: 'asin',
            search: false,
        },
        {
            title: 'Sales Target US',
            dataIndex: 'us_sales_target',
            key: 'us_sales_target',
            search: false,
        },
        {
            title: 'Sales Target CA',
            dataIndex: 'ca_sales_target',
            key: 'ca_sales_target',
            search: false,
        },
        {
            title: 'Sales',
            dataIndex: 'daily_sales',
            key: 'daily_sales',
            search: false,
            sorter: {
                compare: (a, b) => a.dailyOverValue - b.dailyOverValue,
                multiple: 3,
            },
            render: (_, record) => {
                // 判断本月有多少天
                const difference = record.dailyOverValue
                let color = <span>{record.daily_sales}</span>
                if (difference > 0) {
                    color = <span style={{ 'color': 'red', 'fontWeight': 'bold' }}>{record.daily_sales} <ArrowUpOutlined /></span>
                } else if (difference < 0) {
                    color = <span style={{ 'color': 'green', 'fontWeight': 'bold' }}>{record.daily_sales} <ArrowDownOutlined /></span>
                }
                return color
            }
        },
        {
            title: 'Weekly Sales',
            dataIndex: 'weekly_sales',
            key: 'weekly_sales',
            search: false,
        },
        {
            title: 'Residual Inventory',
            dataIndex: 'inventory',
            key: 'inventory',
            search: false,
        }
    ]
    const initData = async (params?: SalesTargetListParams) => {
        return new Promise((resolve) => {
            getSalesTargetList(params).then(res => {
                if (res.code) {
                    const tempData = res.data.map((item: SalesTargetItem) => {
                        const { us_sales_target, ca_sales_target, au_sales_target } = item
                        // 判断这三个字符串是否为空是否为null是否为数字格式
                        let usSt = 0, caSt = 0, auSt = 0
                        if (us_sales_target && !isNaN(Number(us_sales_target))) {
                            usSt = Number(us_sales_target)
                            if (usSt < 0) usSt = 0
                        }
                        if (ca_sales_target && !isNaN(Number(ca_sales_target))) {
                            caSt = Number(ca_sales_target)
                            if (caSt < 0) caSt = 0
                        }
                        if (au_sales_target && !isNaN(Number(au_sales_target))) {
                            auSt = Number(au_sales_target)
                            if (auSt < 0) auSt = 0
                        }
                        const salesTarget = usSt + caSt + auSt
                        return {
                            ...item,
                            salesTarget,
                            dailyOverValue: getDailySituation(item, salesTarget)
                        }
                    })
                    // tempData = tempData.sort((a: SalesTargetItem, b: SalesTargetItem) => a.dailyOverValue - b.dailyOverValue)
                    resolve(tempData)
                } else {
                    message.error(res.msg)
                    resolve([])
                }
            })
        })
    }
    return (<>
        <ProTable<SalesTargetItem, SalesTargetListParams>
            // params 是需要自带的参数
            // 这个参数优先级更高，会覆盖查询表单的参数
            // params={params}
            columns={columns}
            request={async (
                // 第一个参数 params 查询表单和 params 参数的结合
                // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
                params: any,
                sort,
                filter,
            ) => {
                // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
                // 如果需要转化参数可以在这里进行修改
                let tempParams = { ...params }
                if (params.date && params.date.length === 2) {
                    tempParams = {
                        ...tempParams,
                        start_date: params.date[0],
                        end_date: params.date[1],
                    }
                }
                const data: any = await initData(tempParams);
                return {
                    data: data,
                    // success 请返回 true，
                    // 不然 table 会停止解析数据，即使有数据
                    success: 1,
                    // 不传会使用 data 的长度，如果是分页一定要传
                    total: data.length,
                };
            }}
            pagination={false}
        />
    </>);
};
