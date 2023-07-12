import { Button, Card, Table, Input, Space, message, Image, Typography, Segmented, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForPlan, editPlan, editExpectTime } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
import { EditTwoTone } from '@ant-design/icons';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import getInfoComponent from './components/getInfoComponent'
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
const { Text } = Typography;
const { Search } = Input;



const TimeEditComponent = (props: { record: RequirementListItem, refresh: () => void }) => {
    const { record, refresh } = props
    const [time, setTime] = useState<any>(record.expectTime ? dayjs(record.expectTime) : dayjs());
    const [isEdit, setIsEdit] = useState(false);

    const editPlanTime = (expectTime: string) => {
        editExpectTime({ id: record.id, expect_time: expectTime }).then(res => {
            if (res.code) {
                message.success('修改成功')
                refresh()
            } else {
                throw res.msg
            }
        }).catch(err => {
            message.error(err)
        })
    }

    const onChange = (date: any) => {
        if (!date) return
        setTime(date)
        setIsEdit(false)
        editPlanTime(date.format('YYYY-MM-DD'))
    };
    const getEditComponent = () => {
        return <>
            {record.expectTime}
            <EditTwoTone onClick={() => {
                setIsEdit(true)
            }} />
        </>
    }
    return <div onBlur={() => {
        setIsEdit(false)
    }}>
        {isEdit ? <DatePicker
            onBlur={() => {
                setIsEdit(false)
            }}
            value={time}
            format={'YYYY-MM-DD'}
            onChange={onChange} showTime /> : getEditComponent()}
    </div>
}

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForPlan({ keyword: keyword || undefined }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                // 数据拆分priority大于0的升序，等于0的跟在后面
                const tempData1 = sourceData.filter((item: any) => item.priority > 0).sort((a: any, b: any) => a.priority - b.priority)
                const tempData2 = sourceData.filter((item: any) => item.priority === 0)
                const newData = tempData1.concat(tempData2)
                setDataSource(newData)
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }
    const editPlanStutas = (id: number, status: number) => {
        editPlan({ id, status }).then(res => {
            if (res.code) {
                initData()
            } else {
                throw res.msg
            }
        }).catch(err => {
            message.error(err)
        })
    }
    const columns: ColumnsType<RequirementListItem> = [
        {
            title: '信息',
            dataIndex: 'info',
            key: 'info',
            width: 385,
            render: (text: any, record: any) => getInfoComponent(record)
        },
        {
            title: '创建信息',
            dataIndex: 'creator',
            key: 'creator',
            render: (text: any, record: any) => {
                return <div style={{ 'width': '210px' }}>
                    <div><Text type="secondary">创建人：</Text>{record.creator}</div>
                    <div><Text type="secondary">创建时间：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            title: '优先级',
            dataIndex: 'close_sort',
            key: 'close_sort',
        },
        {
            // 状态
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (_, record: any) => {
                // 黄红绿
                const getColor = (status: number, optionStatus: number, front: string) => {
                    let color = ''
                    if (record.status === optionStatus) {
                        switch (status) {
                            case 5:
                                color = '#f39f6c'
                                break;
                            case 6:
                                color = 'blue'
                                break;
                            case 7:
                                color = 'green'
                                break;
                        }
                    }
                    // 字体加粗
                    return <span style={{ color: color, fontWeight: record.status === optionStatus ? 'bold' : 'normal' }}>{front}</span>
                }
                return <Segmented
                    size='large'
                    value={record.status}
                    onChange={(value: any) => {
                        editPlanStutas(record.id, value)
                    }}
                    options={[
                        {
                            label: getColor(record.status, 5, '待排期'),
                            value: 5,
                        },
                        {
                            label: getColor(record.status, 6, '制作中'),
                            value: 6,
                        },
                        {
                            label: getColor(record.status, 7, '已完成'),
                            value: 7,
                        },
                    ]}
                />
            }
        },
        {
            // 预计完成时间
            title: '预计完成时间',
            dataIndex: 'expectTime',
            key: 'expectTime',
            render: (_, record) => {
                return <TimeEditComponent record={record} refresh={initData} />
            }
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            render: (_, record) => {
                return <>
                    <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}`)
                    }}>View</Button>
                </>
            }
        }
    ]
    useEffect(() => {
        initData()
    }, [keyword])
    return (
        <Card
            size='small'
            title={<Search placeholder="input search text" onSearch={onSearch} style={{ width: 200, marginLeft: '10px' }} />}
            extra={<Button type="primary" onClick={initData}>刷新</Button>}
        >
            <Table
                loading={loading}
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
            />
        </Card>
    );
};

export default App;