import { Button, Space, message, Typography, InputNumber, Divider, Switch, Select } from 'antd';
import React, { useState } from 'react';
import { getListForSort, editSortV3 } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
import getInfoComponent from './components/getInfoComponent'
import { FormattedMessage } from 'umi';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
const { Text } = Typography;


const localFrontFromRequirementList = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.requirementSortList.${key}`} />
}


const App: React.FC = () => {
    const [sorts, setSorts] = useState<number[]>([]);
    const checkSort = (sort: number) => {
        return sorts.includes(sort)
    }
    const getColor = (record: RequirementListItem) => {
        let color = ''
        let text = null
        let msg = ''
        switch (record.status) {
            // 1:可编辑   2：待排序   3：待审核  4:审核失败   5：待排期   6：制作中 7：完成  null:待审核
            case 2:
                color = ''
                text = localFrontFromRequirementList('PendingSorting')
                break;
            case 3:
                color = '#2db7f5'
                text = localFrontFromRequirementList('PendingReview')
                break;
            case 4:
                color = 'red'
                text = localFrontFromRequirementList('FailTheAudit')
                msg = record.reason
                break;
            case 5:
                color = '#f39f6c'
                text = localFrontFromRequirementList('PendingScheduling')
                break;
            case 6:
                color = 'blue'
                text = localFrontFromRequirementList('InProduction')
                break;
            case 7:
                color = 'green'
                text = localFrontFromRequirementList('Completed')
                break;
            case 8:
                color = '#2db7f5'
                text = localFrontFromRequirementList('RequirementsAudit')
                break;
        }
        // 字体加粗
        return <span style={{ color: color, fontWeight: record.status === 4 ? 'bold' : '' }}>{text}{msg ? `(${msg})` : ''}</span>
    }

    const columns: ProColumns<RequirementListItem>[] = [
        {
            title: <FormattedMessage id={`pages.odika.RequirementList.keyword`} />,
            dataIndex: 'keyword',
            key: 'keyword',
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
            width: 200,
            search: false,
            render: (_, record) => {
                return <div style={{ 'width': '200px' }}>
                    <div><Text type="secondary">{localFrontFromRequirementList('creator')}：</Text>{record.creator}</div>
                    <div><Text type="secondary">{localFrontFromRequirementList('creationTime')}：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            // priority
            title: localFront('priority'),
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            search: false,
            render: (_, record, __, action) => {
                if (record.status === 7 || record.status === 8 || record.status === 4) {
                    return ''
                }
                if (!!record.close_sort) {
                    return record.close_sort
                }
                return <Select
                    defaultValue={record.priority}
                    style={{ width: 70 }}
                    onChange={(value) => {
                        if (value) {
                            editSortV3({ id: record.id, no: value, is_lock: 0 }).then(res => {
                                if (res.code) {
                                    action?.reload()
                                } else {
                                    throw res.msg
                                }
                            }).catch(err => {
                                message.error(err)
                            })
                        }
                    }}
                >
                    {
                        Array.from({ length: 50 }, (_, i) => i + 1).map(item => {
                            return <Select.Option
                                value={item}
                                disabled={checkSort(item)}
                                key={item}>
                                {item}
                            </Select.Option>
                        })
                    }
                </Select>
            }
        },
        {
            title: localFront('status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            search: false,
            render: (_, record) => {
                return getColor(record)
            }
        },
        {
            title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 150,
            search: false,
            render: (_, record, __, action) => {
                if (record.status === 8 || record.status === 4) {
                    return <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}&check=true&type=${record.status === 4 ? 4 : 1}`)
                    }}><FormattedMessage id='pages.odika.requirementSortList.check' /></Button>
                }
                return <Space>
                    {record.status !== 7 ? (<>
                        <Switch style={{ width: '70px' }} checkedChildren={localFront('locked')} unCheckedChildren={localFront('lock')} disabled={record.status > 5} checked={!!record.close_sort || record.status === 7} onChange={val => {
                            if (checkSort(record.priority) && val) {
                                message.error('This priority is already in use!')
                                return false
                            }
                            editSortV3({ id: record.id, no: record.priority, is_lock: val ? 1 : 0 }).then(res => {
                                if (res.code) {
                                    action?.reload()
                                } else {
                                    throw res.msg
                                }
                            }).catch(err => {
                                message.error(err)
                            })
                        }} />
                        <Divider type="vertical" />
                    </>) : null}
                    <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}`)
                    }}><FormattedMessage id='pages.layouts.View' /></Button>
                </Space>
            }
        }
    ]
    return (
        <ProTable<RequirementListItem>
            rowKey="id"
            columns={columns}
            request={async (params = {}) => {
                const tempParams = {
                    ...params,
                    len: params.pageSize,
                    page: params.current
                };
                const res = await getListForSort(tempParams);
                const { data } = res;
                setSorts(data.sorts)
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