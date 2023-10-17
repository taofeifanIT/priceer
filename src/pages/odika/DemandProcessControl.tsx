import { Button, Card, Table, Input, message, Typography, Segmented, DatePicker, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForPlan, editPlan, editExpectTime, editSortV3 } from '@/services/odika/requirementList';
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
import { useModel } from 'umi';
import { FormattedMessage, getLocale } from 'umi';
import SetValueComponent from '@/components/SetValueComponent'


dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
const { Text } = Typography;
const { Search } = Input;

const localFrontFromRequirementList = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.requirementSortList.${key}`} />
}

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

// 黄红绿
const getColor = (status: number, optionStatus: number, front: string | JSX.Element) => {
    let color = ''
    if (status === optionStatus) {
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
    return <span style={{ color: color, fontWeight: status === optionStatus ? 'bold' : 'normal' }}>{front}</span>
}

const getSegmentOptions = (record: RequirementListItem) => [
    {
        label: getColor(record.status, 5, localFrontFromRequirementList('PendingScheduling')),
        value: 5,
    },
    {
        label: getColor(record.status, 6, localFrontFromRequirementList('InProduction')),
        value: 6,
    },
    {
        label: getColor(record.status, 7, localFrontFromRequirementList('Completed')),
        value: 7,
    },
]

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 30,
            total: 0,
        },
    });
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const isDesigner = currentUser?.authGroup.title === 'Designer'
    const StatusWidth = getLocale() === 'zh-CN' ? 240 : 420
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForPlan({
            keyword: keyword || undefined, ...{
                len: tableParams.pagination?.pageSize,
                page: tableParams.pagination?.current,
                priority: isDesigner ? 1 : undefined
            }
        }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                // 数据拆分priority大于0的升序，等于0的跟在后面
                // const tempData1 = sourceData.filter((item: any) => item.close_sort > 0).sort((a: any, b: any) => a.close_sort - b.close_sort)
                // const tempData2 = sourceData.filter((item: any) => item.close_sort === 0)
                // const newData = tempData1.concat(tempData2)
                setDataSource(sourceData)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.total,
                        // 200 is mock data, you should read it from server
                        // total: data.totalCount,
                    },
                });
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }

    const handleTableChange = (
        pagination: any,
        filters: Record<string, any>,
        sorter: any,
    ) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setDataSource([]);
        }
    };
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
            title: localFrontFromRequirementList('info'),
            dataIndex: 'info',
            key: 'info',
            width: 385,
            render: (text: any, record: any) => getInfoComponent(record)
        },
        {
            title: localFrontFromRequirementList('CreateInfo'),
            dataIndex: 'creator',
            key: 'creator',
            width: 195,
            render: (text: any, record: any) => {
                return <div style={{ 'width': 195 }}>
                    <div><Text type="secondary">{localFrontFromRequirementList('creator')}：</Text>{record.creator}</div>
                    <div><Text type="secondary">{localFrontFromRequirementList('creationTime')}：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            title: localFront('priority'),
            dataIndex: 'close_sort',
            key: 'close_sort',
            width: 90,
            align: 'center',
            render: (_, record) => {
                return record.close_sort === 0 ? null :
                    <SetValueComponent
                        type='number'
                        value={record.close_sort}
                        editKey='no'
                        id={record.id}
                        api={editSortV3}
                        otherParams={{ is_lock: 1 }}
                        refresh={initData}
                        disabled={isDesigner}
                        numberStep={1}
                    />
            }
        },
        {
            // 状态
            title: localFront('status'),
            dataIndex: 'status',
            key: 'status',
            width: StatusWidth,
            render: (_, record) => {
                // 如果是设计师，只能看查看状态不能修改
                if (isDesigner) {
                    return getSegmentOptions(record).find(item => item.value === record.status)?.label || null
                }
                return <Segmented
                    size='large'
                    value={record.status}
                    onChange={(value: any) => {
                        editPlanStutas(record.id, value)
                    }}
                    options={getSegmentOptions(record)}
                />
            }
        },
        {
            // 预计完成时间
            title: localFrontFromRequirementList('EstimatedCompletionTime'),
            dataIndex: 'expectTime',
            key: 'expectTime',
            width: 200,
            render: (_, record) => {
                if (isDesigner) return record.expectTime
                return <TimeEditComponent record={record} refresh={initData} />
            }
        },
        {
            title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
            dataIndex: 'action',
            key: 'action',
            width: 80,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                return <>
                    <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}`)
                    }}><FormattedMessage id='pages.layouts.View' /></Button>
                </>
            }
        }
    ]
    useEffect(() => {
        initData()
    }, [keyword, JSON.stringify(tableParams)])
    return (
        <Card
            size='small'
            title={<Search placeholder="input search text" onSearch={onSearch} style={{ width: 200, marginLeft: '10px' }} />}
            extra={<Button type="primary" onClick={initData}><FormattedMessage id='pages.layouts.Refresh' /></Button>}
        >
            <Table
                loading={loading}
                rowKey="id"
                scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0) }}
                columns={columns}
                pagination={tableParams.pagination}
                dataSource={dataSource}
                onChange={handleTableChange}
            />
        </Card>
    );
};

export default App;