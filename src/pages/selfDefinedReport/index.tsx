import { Select, Space, Table, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { getInventoryAge } from '@/services/reportView';

const { Option } = Select;

export default () => {
    // 报表模板列表
    const [reportTemplateList] = useState([
        'inventory_age',
    ]);
    const [reportData, setReportData] = useState({
        columns: [],
        dataSource: [],
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [reportTemplate, setReportTemplate] = useState('inventory_age');
    const initData = (params: {
        type: string;
        page: number;
        len: number;
    }) => {
        setLoading(true);
        getInventoryAge(params).then((res: any) => {
            const { data, code, msg } = res;
            if (!code) {
                throw msg
            };
            const tempColumns: any = Object.keys(data.content[0]).map((item) => {
                return {
                    title: item,
                    dataIndex: item,
                    key: item,
                };
            });
            setReportData({
                columns: tempColumns,
                dataSource: data.content,
            });
            setPagination({
                current: params.page,
                pageSize: params.len,
                total: data.total_page * params.len,
            });
        }).catch((err) => {
            console.log(err);
            message.error(JSON.stringify(err));
        }).finally(() => {
            setLoading(false);
        });
    }
    useEffect(() => {
        initData({
            type: reportTemplate,
            page: 1,
            len: 10,
        });
    }, []);
    return (
        <div style={{ background: '#fff', padding: 8 }}>
            <Space>
                <span>Template Name：</span>
                <Select style={{ width: 180 }} value={reportTemplate} onChange={(val) => {
                    setReportTemplate(val);
                }}>
                    {reportTemplateList.map((item) => {
                        return (
                            <Option key={item} value={item}>
                                {item}
                            </Option>
                        );
                    })}
                </Select>
                <Button type="primary" loading={loading} onClick={() => {
                    initData({
                        type: reportTemplate,
                        page: pagination.current,
                        len: pagination.pageSize,
                    })
                }}>Generate</Button>
            </Space>
            <Table
                columns={reportData.columns}
                dataSource={reportData.dataSource}
                pagination={pagination}
                loading={loading}
                onChange={(page: any) => {
                    // setPagination(page);
                    initData({
                        type: reportTemplate,
                        page: page.current,
                        len: page.pageSize,
                    })
                }}
            />
        </div>
    )
}