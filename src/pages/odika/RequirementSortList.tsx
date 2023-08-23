import { Button, Card, Table, Input, Space, message, Typography, InputNumber, Divider, Switch } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForSort, editSortV3 } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import getInfoComponent from './components/getInfoComponent'
import { FormattedMessage } from 'umi';
const { Text } = Typography;
const { Search } = Input;


interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}


const localFrontFromRequirementList = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.requirementSortList.${key}`} />
}


const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [sorts, setSorts] = useState<number[]>([]);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            showSizeChanger: true,
            showQuickJumper: true,
            current: 1,
            pageSize: 10,
        },
    });
    // 设置页数

    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForSort({
            keyword: keyword || undefined, ...{
                len: tableParams.pagination?.pageSize,
                page: tableParams.pagination?.current
            }
        }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                // const tempData1 = sourceData.filter((item: any) => item.close_sort === 0 && item.status !== 7)
                // const tempData2 = sourceData.filter((item: any) => item.close_sort !== 0 && item.status >= 3).sort((a: any, b: any) => a.close_sort - b.close_sort)
                // const tempData3 = sourceData.filter((item: any) => item.close_sort === 0 && item.status > 3)
                // const newData = tempData1.concat(tempData2).concat(tempData3)
                setDataSource(sourceData)
                setSorts(res.data.sorts)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.total,
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
    const checkSort = (sort: number) => {
        return sorts.includes(sort)
    }
    const getColor = (status: number) => {
        let color = ''
        let text = null
        switch (status) {
            // 1:可编辑   2：待排序   3：待审核  4:审核失败   5：待排期   6：制作中 7：完成
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
        }
        // 字体加粗
        return <span style={{ color: color, fontWeight: 'bold' }}>{text}</span>
    }

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue>,
        sorter: SorterResult<any>,
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
            width: 200,
            render: (text: any, record: any) => {
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
            render: (_, record) => {
                if (record.status === 7) {
                    return ''
                }
                if (!!record.close_sort) {
                    return record.close_sort
                }
                return <InputNumber
                    min={1}
                    defaultValue={record.priority}
                    onChange={(value) => {
                        if (value) {
                            editSortV3({ id: record.id, no: value, is_lock: 0 }).then(res => {
                                if (res.code) {
                                    initData()
                                } else {
                                    throw res.msg
                                }
                            }).catch(err => {
                                message.error(err)
                            })
                        }
                    }}
                />
            }
        },
        {
            title: localFront('status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (_, record) => {
                return getColor(record.status)
            }
        },
        {
            title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => {
                return <Space>
                    {record.status !== 7 ? (<>
                        <Switch style={{ width: '70px' }} checkedChildren={localFront('locked')} unCheckedChildren={localFront('lock')} disabled={record.status > 5} checked={!!record.close_sort || record.status === 7} onChange={val => {
                            if (checkSort(record.priority) && val) {
                                message.error('This priority is already in use!')
                                return false
                            }
                            editSortV3({ id: record.id, no: record.priority, is_lock: val ? 1 : 0 }).then(res => {
                                if (res.code) {
                                    initData()
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
                columns={columns}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                dataSource={dataSource}
            />
        </Card>
    );
};

export default App;