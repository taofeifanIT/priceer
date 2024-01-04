import { Button, message, Typography, Segmented, DatePicker } from 'antd';
import React, { useState, useRef } from 'react';
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
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import SetValueComponent from '@/components/SetValueComponent'


dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
const { Text } = Typography;

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
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const isDesignerManager = currentUser?.authGroup.title === 'design manager'
    const isDesigner = currentUser?.authGroup.title === 'Designer'
    // const isRequirementsManager = currentUser?.authGroup.title === 'Requirements manager'
    const StatusWidth = getLocale() === 'zh-CN' ? 240 : 420
    const actionTableRef = useRef<ActionType>();
    const editPlanStutas = (id: number, status: number) => {
        editPlan({ id, status }).then(res => {
            if (res.code) {
                actionTableRef.current?.reload()
            } else {
                throw res.msg
            }
        }).catch(err => {
            message.error(err)
        })
    }
    const columns: ProColumns<RequirementListItem>[] = [
        // {
        //     title: <FormattedMessage id={`pages.odika.RequirementList.keyword`} />,
        //     dataIndex: 'keyword',
        //     key: 'keyword',
        //     hideInTable: true,
        // },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            hideInTable: true,
        },
        {
            title: <FormattedMessage id='page.layouts.userLayout.username.placeholder' />,
            dataIndex: 'username',
            key: 'username',
            hideInTable: true,
        },
        {
            title: localFrontFromRequirementList('info'),
            dataIndex: 'info',
            key: 'info',
            width: 385,
            search: false,
            render: (_, record) => getInfoComponent(record)
        },
        {
            title: localFrontFromRequirementList('CreateInfo'),
            dataIndex: 'creator',
            key: 'creator',
            width: 195,
            search: false,
            render: (_, record) => {
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
            width: 100,
            align: 'center',
            search: false,
            render: (_, record, __, action) => {
                return record.close_sort === 0 ? null :
                    <SetValueComponent
                        type='number'
                        value={record.close_sort}
                        editKey='no'
                        id={record.id}
                        api={editSortV3}
                        otherParams={{ is_lock: 1 }}
                        refresh={() => action?.reload()}
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
            width: isDesignerManager ? StatusWidth : 180,
            valueType: 'select',
            valueEnum: {
                'option-5': { text: localFrontFromRequirementList('PendingScheduling') },
                'option-6': { text: localFrontFromRequirementList('InProduction') },
                'option-7': { text: localFrontFromRequirementList('Completed') },
                'option-10': { text: localFrontFromRequirementList('Canto') },
                'option-11': { text: localFrontFromRequirementList('lastInstance') },
            },
            render: (_, record) => {
                // 如果是设计师，只能看查看状态不能修改
                if (isDesignerManager) {
                    return <Segmented
                        disabled={record.status === 10}
                        size='large'
                        value={record.status}
                        onChange={(value: any) => {
                            editPlanStutas(record.id, value)
                        }}
                        options={getSegmentOptions(record)}
                    />

                }
                return getSegmentOptions(record).find(item => item.value === record.status)?.label || null
            }
        },
        {
            // 预计完成时间
            title: localFrontFromRequirementList('EstimatedCompletionTime'),
            dataIndex: 'expectTime',
            key: 'expectTime',
            width: 220,
            search: false,
            render: (_, record, __, action) => {
                if (isDesignerManager) return <TimeEditComponent record={record} refresh={() => action?.reload()} />
                return record.expectTime
            }
        },
        {
            // reason_canto
            title: localFront('reason_canto'),
            dataIndex: 'reason_canto',
            key: 'reason_canto',
            width: 130,
            search: false,
            render: (_, record) => {
                if (record.status === 10) {
                    return <span style={{ color: 'green' }}>
                        {/* Have been accepted */}
                        <FormattedMessage id='pages.odika.requirementSortList.acceptanceResultforaccepted' />
                    </span>
                }
                if (record.reason_canto) {
                    return <span style={{ color: 'red' }}>
                        {record.reason_canto}
                    </span>
                }
                return ''
            }

        },
        {
            title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
            dataIndex: 'action',
            key: 'action',
            width: 100,
            align: 'center',
            fixed: 'right',
            search: false,
            render: (_, record) => {
                // if (isRequirementsManager && record.status === 7) {
                //     return <Button type="link" onClick={() => {
                //         window.open(`/odika/ViewDesign?id=${record.id}&check=true&type=3`)
                //     }}><FormattedMessage id='pages.odika.requirementSortList.check' /></Button>
                // }
                return <>
                    <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}`)
                    }}><FormattedMessage id='pages.layouts.View' /></Button>
                </>
            }
        }
    ]
    return (
        <ProTable<RequirementListItem>
            rowKey="id"
            actionRef={actionTableRef}
            columns={columns}
            request={async (params = {}) => {
                const tempParams = {
                    ...params,
                    status: params.status ? params.status.split('-')[1] : undefined,
                    len: params.pageSize,
                    page: params.current
                };
                const res = await getListForPlan(tempParams)
                const { data } = res;
                return {
                    data: data.data,
                    success: res.code === 1,
                    total: data.total,
                };
            }}
            size='small'
            options={{
                density: false,
                fullScreen: false,
                setting: false,
            }}
            pagination={{
                pageSize: 10,
            }}
        />
    );
};

export default App;