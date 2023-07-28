import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getHistoryLog } from '@/services/removalOrder'
import type { HistoryLogItem } from '@/services/removalOrder'

// id: number;
// admin_id: number;
// username: string;
// name: string;
// before: string;
// after: string;
// create_time: string;

export default () => {
    const actionRef = useRef<ActionType>();
    const columns: ProColumns<HistoryLogItem>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            key: 'index',
            fixed: 'left',
            width: 48,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: 120,
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
            width: 200,
            ellipsis: true,
            search: false,
        },
        {
            title: 'Operating Result',
            dataIndex: 'after',
            key: 'after',
            width: 120,
            search: false,
        },
        {
            title: 'Operation Time',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 120,
            search: false,
        }
    ];
    return (
        <ProTable<HistoryLogItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            headerTitle="History Log"
            cardBordered
            request={async (params = {}, sort, filter) => {
                const tempParams = { ...params, ...filter, ...sort, len: params.pageSize, page: params.current }
                const res = await getHistoryLog(tempParams)
                const { data, code } = res
                return {
                    data: data.data,
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
        />
    );
};