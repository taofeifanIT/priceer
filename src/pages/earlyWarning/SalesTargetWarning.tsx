import { message } from 'antd';
import { getSalesTargetList, getSalesTargetBrand } from '@/services/earlyWarning'
import type { SalesTargetListParams } from '@/services/earlyWarning'
import type { SalesTargetItem } from '@/services/earlyWarning'
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { countWorkDay } from '@/utils/utils'

export default () => {
    const actionRef = useRef<ActionType>();
    const formRef = useRef<FormInstance>();
    const getDailySituation = (daily_sales: number, salesTarget: number, date?: string[], sku?: string) => {
        let difference = 0
        // 计算本月有多少工作日
        const countWorkDayNum = countWorkDay(dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD'))
        const days = dayjs().daysInMonth()
        const countWeekDayNum = days - countWorkDayNum
        // 工作日算1 天 周末算0.25天
        const workDayNumInMonth = countWorkDayNum + (countWeekDayNum * 0.25)
        // 计算每天的平均销量
        const averageSales = salesTarget / workDayNumInMonth
        if (!date) {
            difference = daily_sales - averageSales
        } else {
            const daysRangeNum = dayjs(date[1]).diff(dayjs(date[0]), 'day')
            const workDayNum = countWorkDay(date[0], date[1])
            const weekDayNum = daysRangeNum - workDayNum
            // 工作日算1 天 周末算0.25天
            const workDayNumInRange = workDayNum + (weekDayNum * 0.25)
            // 算出这段时间内的目标销量
            const salesTargetInRange = averageSales * workDayNumInRange
            // console.log('averageSales', averageSales, 'workDayNumInRange', workDayNumInRange, 'salesTargetInRange', salesTargetInRange, 'daily_sales', daily_sales, 'difference', difference, 'daysRangeNum', daysRangeNum, 'workDayNum', workDayNum, 'weekDayNum', weekDayNum, 'workDayNumInMonth', workDayNumInMonth, 'countWorkDayNum', countWorkDayNum, 'countWeekDayNum', countWeekDayNum, 'salesTarget', salesTarget)
            // 计算差值
            difference = daily_sales - salesTargetInRange
        }
        return difference
    }
    const salesTargetStatus = (dailyOverValue: number, daily_sales: number) => {
        const difference = dailyOverValue
        let textDom = <span>{daily_sales}</span>
        if (difference > 0) {
            textDom = <span style={{ 'color': 'red', 'fontWeight': 'bold' }}>{daily_sales} <ArrowUpOutlined /></span>
        } else if (difference < 0) {
            textDom = <span style={{ 'color': 'green', 'fontWeight': 'bold' }}>{daily_sales} <ArrowDownOutlined /></span>
        }
        return textDom
    }
    const getBrands = async () => {
        let brandData: any = []
        const res = await getSalesTargetBrand()
        if (res.code) {
            brandData = res.data.map((brand: string) => ({ label: brand, value: brand }))
        } else {
            message.error(res.msg)
        }
        return brandData
    }
    const columns: ProColumns<SalesTargetItem> = [
        {
            title: 'Date',
            dataIndex: 'date',
            valueType: 'dateRange',
            hideInTable: true,
        },
        {
            title: 'Sales Tendency',
            dataIndex: 'sales_tendency',
            valueType: 'select',
            valueEnum: {
                1: { text: 'Up US' },
                2: { text: 'Down US' },
                4: { text: 'Up CA' },
                5: { text: 'Down CA' },
            },
            hideInTable: true,
        },
        {
            // minimum inventory
            title: 'Minimum Inventory',
            dataIndex: 'minimum_inventory',
            initialValue: 0,
            valueType: 'digit',
            hideInTable: true,
        },
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            fixed: 'left',
            width: 48,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 170,
            fixed: 'left',
            ellipsis: true,
            copyable: true,
            // ellipsis: true,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            valueType: 'select',
            width: 120,
            request: async () => {
                return await getBrands()
            }
        },
        {
            title: 'Sales Target US',
            dataIndex: 'us_sales_target',
            key: 'us_sales_target',
            search: false,
            width: 130,
            sorter: {
                compare: (a, b) => a.us_sales_target - b.us_sales_target,
            },
        },
        {
            title: 'Sales US',
            dataIndex: 'us_sales',
            key: 'us_sales',
            width: 100,
            sorter: {
                compare: (a, b) => a.us_sales_daily - b.us_sales_daily,
            },
            search: false,
            render: (_, record) => {
                return salesTargetStatus(record.us_sales_daily, record.us_sales)
            }
        },
        {
            title: 'Weekly Sales US',
            dataIndex: 'us_sales_weekly',
            key: 'us_sales_weekly',
            search: false,
            width: 150,
            sorter: {
                compare: (a, b) => a.us_sales_weekly_daily - b.us_sales_weekly_daily,
            },
        },
        {
            title: 'Residual Inventory US',
            dataIndex: 'us_inventory',
            key: 'us_inventory',
            search: false,
            width: 190,
            sorter: {
                compare: (a, b) => a.us_inventory - b.us_inventory,
            },
        },
        {
            title: 'Sales Target CA',
            dataIndex: 'ca_sales_target',
            key: 'ca_sales_target',
            search: false,
            width: 130,
            sorter: {
                compare: (a, b) => a.ca_sales_target - b.ca_sales_target,
            },
        },
        {
            title: 'Sales CA',
            dataIndex: 'ca_sales',
            key: 'ca_sales',
            search: false,
            width: 100,
            sorter: {
                compare: (a, b) => a.ca_sales_daily - b.ca_sales_daily,
            },
            render: (_, record) => {
                return salesTargetStatus(record.ca_sales_daily, record.ca_sales)
            }
        },
        {
            title: 'Weekly Sales CA',
            dataIndex: 'ca_sales_weekly',
            key: 'ca_sales_weekly',
            search: false,
            width: 150,
            sorter: {
                compare: (a, b) => a.ca_sales_weekly_daily - b.ca_sales_weekly_daily,
            },
        },
        {
            title: 'Residual Inventory CA',
            dataIndex: 'ca_inventory',
            key: 'ca_inventory',
            search: false,
            width: 190,
            sorter: {
                compare: (a, b) => a.ca_inventory - b.ca_inventory,
            },
        }
    ]
    const [currentColumns, setCurrentColumns] = useState<any>(columns)
    const initData = async (params?: SalesTargetListParams & { date: string[] }) => {
        return new Promise((resolve) => {
            getSalesTargetList(params).then(res => {
                if (res.code) {
                    const tempData = res.data.map((item: SalesTargetItem) => {
                        const { us_sales_target, ca_sales_target, au_sales_target, daily_sales_country, weekly_sales_country, inventory_country } = item
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
                        const us_sales = daily_sales_country.length ? (daily_sales_country.find(record => record.country_id === 1)?.number || 0) : 0
                        const ca_sales = daily_sales_country.length ? (daily_sales_country.find(record => record.country_id === 2)?.number || 0) : 0
                        const us_sales_weekly = weekly_sales_country.length ? (weekly_sales_country.find(record => record.country_id === 1)?.number || 0) : 0
                        const ca_sales_weekly = weekly_sales_country.length ? (weekly_sales_country.find(record => record.country_id === 2)?.number || 0) : 0
                        const us_inventory = inventory_country.length ? (inventory_country.find(record => record.country_id === 1)?.number || 0) : 0
                        const ca_inventory = inventory_country.length ? (inventory_country.find(record => record.country_id === 2)?.number || 0) : 0
                        return {
                            ...item,
                            salesTarget,
                            // dailyOverValue: getDailySituation(item.daily_sales, salesTarget, params?.date),
                            us_sales,
                            ca_sales,
                            us_sales_weekly,
                            ca_sales_weekly,
                            us_inventory,
                            ca_inventory,
                            us_sales_daily: getDailySituation(us_sales, Math.abs(parseInt(us_sales_target)), params?.date, item.sku),
                            ca_sales_daily: getDailySituation(ca_sales, Math.abs(parseInt(ca_sales_target)), params?.date),
                            // us_sales_weekly_daily: getDailySituation(us_sales_weekly, usSt, params?.date),
                            // ca_sales_weekly_daily: getDailySituation(ca_sales_weekly, caSt, params?.date),
                        }
                    })
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
            actionRef={actionRef}
            formRef={formRef}
            size='small'
            columns={currentColumns}
            scroll={{ y: document.body.clientHeight - 340, x: columns.reduce((total: any, item: { width: any; }) => total + (item.width || 0), 0) }}
            revalidateOnFocus={false}
            postData={(data) => {
                let tempData = data
                const { date, sales_tendency, minimum_inventory = 0 } = formRef.current?.getFieldsValue()
                // 判断是否有日期 默认按照日期排序
                if (!date) {
                    tempData.sort((a, b) => a.us_sales_daily - b.us_sales_daily)
                }
                if (sales_tendency) {
                    if (sales_tendency == 1) {
                        tempData.sort((a, b) => a.us_sales_daily - b.us_sales_daily)
                        tempData = tempData.filter(record => record.us_sales_daily > 0)
                    } else if (sales_tendency == 2) {
                        tempData.sort((a, b) => b.us_sales_daily - a.us_sales_daily)
                        tempData = tempData.filter(record => record.us_sales_daily < 0)
                    } else if (sales_tendency == 4) {
                        tempData.sort((a, b) => a.ca_sales_daily - b.ca_sales_daily)
                        tempData = tempData.filter(record => record.ca_sales_daily > 0)
                    } else if (sales_tendency == 5) {
                        tempData.sort((a, b) => b.ca_sales_daily - a.ca_sales_daily)
                        tempData = tempData.filter(record => record.ca_sales_daily < 0)
                    }
                    if (sales_tendency == 1 || sales_tendency == 2) {
                        setCurrentColumns(columns.filter(record => record.dataIndex !== 'ca_sales_target' && record.dataIndex !== 'ca_sales' && record.dataIndex !== 'ca_sales_weekly' && record.dataIndex !== 'ca_inventory'))
                        // 排除剩余库存=0的数据
                        tempData = tempData.filter(record => record.us_inventory > minimum_inventory)
                    }
                    if (sales_tendency == 4 || sales_tendency == 5) {
                        setCurrentColumns(columns.filter(record => record.dataIndex !== 'us_sales_target' && record.dataIndex !== 'us_sales' && record.dataIndex !== 'us_sales_weekly' && record.dataIndex !== 'us_inventory'))
                        // 排除剩余库存=0的数据
                        tempData = tempData.filter(record => record.ca_inventory > minimum_inventory)
                    }
                } else {
                    // 判断当前表头是否全部显示
                    if (currentColumns.length !== columns.length) {
                        setCurrentColumns(columns)
                    }
                }
                return tempData
            }}
            request={async (
                // 第一个参数 params 查询表单和 params 参数的结合
                // 第一个参数中一定会有 pageSize 和  current ，这两个参数是 antd 的规范
                params: any,
                sorter
            ) => {
                // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
                // 如果需要转化参数可以在这里进行修改
                // const brandData = await getBrands()
                let tempParams = { ...params, sorter }
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
            search={{
                labelWidth: 'auto',
            }}
            pagination={false}
        />
    </>);
};
