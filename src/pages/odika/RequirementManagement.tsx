import { Button, Card, Table, Input, message, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForCheck } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
import getInfoComponent from './components/getInfoComponent'
import { FormattedMessage } from 'umi';
const { Text } = Typography;
const { Search } = Input;

const localFrontFromRequirementList = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.requirementSortList.${key}`} />
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
        dataIndex: 'close_sort',
        key: 'close_sort',
    },
    {
        title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        render: (text: any, record) => {
            return <>
                <Button type="link" onClick={() => {
                    window.open(`/odika/ViewDesign?id=${record.id}&check=true`)
                }}><FormattedMessage id='pages.layouts.View' /></Button>
            </>
        }
    }
]


const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForCheck({ keyword: keyword || undefined }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                // sourceData.sort((a: any, b: any) => { return a.close_sort - b.close_sort })
                setDataSource(sourceData)
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }
    useEffect(() => {
        initData()
    }, [keyword])
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
                dataSource={dataSource}
            />
        </Card>
    );
};

export default App;