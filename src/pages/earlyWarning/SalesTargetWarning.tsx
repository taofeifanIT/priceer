import type { DatePickerProps } from 'antd';
import { DatePicker, Table, message, Space, Button } from 'antd';
import { getSalesTargetList } from '@/services/earlyWarning'
import type { SalesTargetItem } from '@/services/earlyWarning'
import type { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// import 'dayjs/locale/en';
// import 'dayjs/plugin/updateLocale';

// dayjs.updateLocale('en', {
//     weekStart: 0,
// });
const { RangePicker } = DatePicker;

export default () => {
    const [salesTargetList, setSalesTargetList] = useState<SalesTargetItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [date, setDate] = useState<DatePickerProps['value']>(null)
    const [salesTile, setSalesTile] = useState<string>('Daily Sales')
    const getDailySituation = (record: SalesTargetItem, salesTarget: number) => {
        // 判断本月有多少天
        const days = dayjs().daysInMonth()
        const averageSales = salesTarget / days
        const difference = record.daily_sales - averageSales
        return difference
    }
    const columns: ColumnsType<SalesTargetItem> = [
        {
            // order
            title: 'Order',
            dataIndex: 'order',
            key: 'order',
            render: (_, record, index) => {
                return index + 1
            }
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            // Asin
            title: 'Asin',
            dataIndex: 'asin',
            key: 'asin',
        },
        {
            // Sales Target
            title: 'Sales Target',
            dataIndex: 'salesTarget',
            key: 'salesTarget',
        },
        {
            // daily_sales
            title: salesTile,
            dataIndex: 'daily_sales',
            key: 'daily_sales',
            sorter: {
                compare: (a, b) => a.dailyOverValue - b.dailyOverValue,
                multiple: 3,
            },
            render: (_, record) => {
                // 判断本月有多少天
                const difference = record.dailyOverValue
                let color = null
                if (difference > 0) {
                    color = <span style={{ 'color': 'red', 'fontWeight': 'bold' }}>{record.daily_sales} <ArrowUpOutlined /></span>
                } else if (difference < 0) {
                    color = <span style={{ 'color': 'green', 'fontWeight': 'bold' }}>{record.daily_sales} <ArrowDownOutlined /></span>
                }
                return color
            }
        },
        {
            // weekly_sales
            title: 'Weekly Sales',
            dataIndex: 'weekly_sales',
            key: 'weekly_sales',
        },
        {
            // residual inventory
            title: 'Residual Inventory',
            dataIndex: 'inventory',
            key: 'inventory',
        },
        {
            // warning message
            title: 'Warning Message',
            dataIndex: 'warning_message',
            key: 'warning_message',
        }
    ]
    const initData = (params?: { start_time: string, end_time: string }) => {
        setLoading(true)
        getSalesTargetList(params).then(res => {
            if (res.code) {
                let tempData = res.data.map((item: SalesTargetItem) => {
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
                if (!date) {
                    tempData = tempData.sort((a: SalesTargetItem, b: SalesTargetItem) => a.dailyOverValue - b.dailyOverValue)
                } else {
                    tempData = tempData.sort((a: SalesTargetItem, b: SalesTargetItem) => a.daily_sales - b.daily_sales)
                }
                setSalesTargetList(tempData)
            } else {
                throw res.msg
            }
        }).catch(err => {
            message.error(err)
            console.log(err)
        }).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        initData()
    }, [])
    return (<>
        <div>
            <Space>
                <RangePicker value={date} onChange={(values: any) => {
                    setDate(values)
                    if (values) {
                        const start_time = dayjs(values[0]).format('YYYY-MM-DD')
                        const end_time = dayjs(values[1]).format('YYYY-MM-DD')
                        setSalesTile(`${start_time} ~ ${end_time} Sales`)
                    } else {
                        setSalesTile('Daily Sales')
                    }
                }} />
                <Button onClick={() => {
                    if (date) {
                        const start_time = dayjs(date[0]).format('YYYY-MM-DD')
                        const end_time = dayjs(date[1]).format('YYYY-MM-DD')
                        initData({ start_time, end_time })
                    } else {
                        initData()
                    }
                }}>Search</Button>
            </Space>
            <Table<SalesTargetItem>
                columns={columns}
                dataSource={salesTargetList}
                loading={loading}
                pagination={false}
            />
        </div>
    </>);
};
