import { Button, Typography } from 'antd';
import React from 'react';
import { getListForCheck } from '@/services/odika/requirementList';
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

const columns: ProColumns<RequirementListItem> = [
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
        render: (text: any, record: any) => getInfoComponent(record)
    },
    {
        title: localFrontFromRequirementList('CreateInfo'),
        dataIndex: 'creator',
        key: 'creator',
        width: 200,
        search: false,
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
        width: 100,
        search: false,
    },
    {
        title: <FormattedMessage id='pages.odika.RequirementList.operation' />,
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        search: false,
        render: (text: any, record) => {
            return <>
                <Button type="link" onClick={() => {
                    window.open(`/odika/ViewDesign?id=${record.id}&check=true&type=2`)
                }}><FormattedMessage id='pages.odika.requirementSortList.check' /></Button>
            </>
        }
    }
]


const App: React.FC = () => {
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
                const res = await getListForCheck(tempParams)
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