import { Button, Card, Table, Input, Space, message, Image, Typography, InputNumber, Divider, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForSort, editSortV3 } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
import getInfoComponent from './components/getInfoComponent'
const { Text } = Typography;
const { Search } = Input;





const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [sorts, setSorts] = useState<number[]>([]);
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForSort({ keyword: keyword || undefined }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                const tempData1 = sourceData.filter((item: any) => item.close_sort === 0 && item.status !== 7)
                const tempData2 = sourceData.filter((item: any) => item.close_sort !== 0 && item.status >= 3).sort((a: any, b: any) => a.close_sort - b.close_sort)
                const tempData3 = sourceData.filter((item: any) => item.close_sort === 0 && item.status > 3)
                const newData = tempData1.concat(tempData2).concat(tempData3)
                setDataSource(newData)
                setSorts(res.data.sorts)
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
        let text = ''
        switch (status) {
            // 1:可编辑   2：待排序   3：待审核  4:审核失败   5：待排期   6：制作中 7：完成
            case 2:
                color = ''
                text = 'Wait sort'
                break;
            case 3:
                color = '#2db7f5'
                text = 'wait for review'
                break;
            case 4:
                color = 'red'
                text = 'Fail the audit'
            case 5:
                color = '#f39f6c'
                text = 'Waiting schedule'
                break;
            case 6:
                color = 'blue'
                text = 'in production'
                break;
            case 7:
                color = 'green'
                text = 'completed'
                break;
        }
        // 字体加粗
        return <span style={{ color: color, fontWeight: 'bold' }}>{text}</span>
    }
    const columns: ColumnsType<RequirementListItem> = [
        {
            title: 'Info',
            dataIndex: 'info',
            key: 'info',
            width: 385,
            render: (text: any, record: any) => getInfoComponent(record)
        },
        {
            title: 'Create message',
            dataIndex: 'creator',
            key: 'creator',
            width: 200,
            render: (text: any, record: any) => {
                return <div style={{ 'width': '200px' }}>
                    <div><Text type="secondary">创建人：</Text>{record.creator}</div>
                    <div><Text type="secondary">创建时间：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            // priority
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 150,
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (_, record) => {
                return getColor(record.status)
            }
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => {
                return <Space>
                    {record.status !== 7 ? (<>
                        <Switch style={{ width: '70px' }} checkedChildren="Locked" unCheckedChildren='Lock' disabled={!!record.close_sort || record.status === 7} checked={!!record.close_sort || record.status === 7} onChange={val => {
                            if (checkSort(record.priority)) {
                                message.error('This priority is already in use!')
                                return false
                            }
                            editSortV3({ id: record.id, no: record.priority, is_lock: 1 }).then(res => {
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
                    }}>View</Button>
                </Space>
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