import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { getHistoryLog } from '@/services/removalOrder'
import { Select } from 'antd';
import type { HistoryLogItem } from '@/services/removalOrder'
import moment_tz from 'moment-timezone'

const { Option } = Select;
// 不同时区的时间转换
const regions = [
    { name: 'Eastern Time', value: 'America/New_York' },
    { name: 'Central Time', value: 'America/Chicago' },
    { name: 'Mountain Time', value: 'America/Denver' },
    { name: 'Pacific Time', value: 'America/Los_Angeles' },
    { name: 'China Standard Time', value: 'Asia/Shanghai' },
]

// 获取当前时区 判断当前是冬令时还是夏令时
// const getTimeZone = () => {
//     const date = new Date()
//     const month = date.getMonth() + 1
//     const day = date.getDate()
//     const hours = date.getHours()
//     const minutes = date.getMinutes()
//     const seconds = date.getSeconds()
//     const time = `${month}/${day}/2021 ${hours}:${minutes}:${seconds}`
//     const timeArr = region.map(item => {
//         return {
//             ...item,
//             time: new Date(time).toLocaleString('en-US', { timeZone: item.value })
//         }
//     })
//     const timeObj = timeArr.find(item => item.time === timeArr[0].time)
//     return timeObj
// }

// 传入时间戳，当前时区，返回对应时区的时间并区分冬令时和夏令时
const getTime = (timeUnix: number, region: string) => {
    // const time = moment_tz(timeUnix).tz(region).format('YYYY-MM-DD HH:mm:ss')
    const timeArr = regions.map(item => {
        return {
            ...item,
            time: moment_tz(timeUnix).tz(region).format('YYYY-MM-DD HH:mm:ss')
        }
    })
    const timeObj: any = timeArr.find(item => item.time === timeArr[0].time)
    // return `${timeObj.name}(${timeObj.value}) ${timeObj.time}`
    return timeObj.time
}


const Index = (props: {
    region: string
}) => {
    const [time, setTime] = useState('');
    let timer = useRef();
    // 点击开始
    const start = () => {
        setTime('')
        timer.current = setInterval(() => {
            setTime(getTime(Date.now(), props.region) + ' ' + props.region)
        }, 1000)
    }
    const clean = () => {
        clearInterval(timer.current);
    }
    useEffect(() => {
        clean()
        start()
        return () => {
            clearInterval(timer.current);
        };
    }, [props.region])
    return (
        <div>
            <div>{time}</div>
        </div>
    )
}

export default () => {
    const actionRef = useRef<ActionType>();
    const [region, setRegion] = useState(regions[4].value)
    const columns: ProColumns<HistoryLogItem>[] = [
        {
            title: 'Operation Time',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 120,
            search: false,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 100,
            search: false,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            search: false,
        },
        {
            title: 'Before',
            dataIndex: 'before',
            key: 'before',
            width: 260,
            ellipsis: true,
            search: false,
        },
        {
            title: 'Operating Result',
            dataIndex: 'after',
            key: 'after',
            width: 260,
            ellipsis: true,
            search: false,
        }
    ];
    useEffect(() => {
        actionRef.current?.reload()
    }, [region])
    return (
        <ProTable<HistoryLogItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            headerTitle={<Index region={region} />}
            cardBordered
            request={async (params = {}, sort, filter) => {
                const tempParams = { ...params, ...filter, ...sort, len: params.pageSize, page: params.current }
                const res = await getHistoryLog(tempParams)
                const { data, code } = res
                // 根据所选择的时区转换时间
                const newData = data.data.map((item: HistoryLogItem) => {
                    return {
                        ...item,
                        create_time: getTime(item.created_at * 1000, region)
                    }
                })
                return {
                    data: newData,
                    success: !!code,
                    total: res.data.total,
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
            form={{
                // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                syncToUrl: (values, type) => {
                    if (type === 'get') {
                        return {
                            ...values,
                            created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            pagination={{
                pageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                // onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
            toolBarRender={() => [
                <Select
                    key='select'
                    value={region}
                    style={{ width: 270 }}
                    onChange={(value) => {
                        console.log(value)
                        setRegion(value)
                    }}>
                    {regions.map(item => <Option key={item.value} value={item.value}>{item.name}+({item.value})</Option>)}
                </Select>
            ]}
        />
    );
};