import { useState, useEffect } from 'react';
import { Input, message, Spin, Alert } from 'antd';
import { getBusinessUnitDataList } from '@/services/businessUnitData/purchasingSalesHistory';
import { Line } from '@ant-design/plots';
import { LineChartOutlined } from '@ant-design/icons';
const { Search } = Input;


const DemoLine = () => {
    const [data, setData] = useState({ po: [], so: [] });
    const [loading, setLoading] = useState(false);
    const asyncFetch = (searchValue: string) => {
        // fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
        //     .then((response) => response.json())
        //     .then((json) => setData(json))
        //     .catch((error) => {
        //         console.log('fetch data failed', error);
        //     });
        setLoading(true);
        getBusinessUnitDataList({ sku: searchValue }).then((res) => {
            if (res.code) {
                // {date: "2019-03-01", rate: 6.667, price: 18.9}
                // setData(res.data);
                const po: any = []
                res.data.po.forEach((item: any) => {
                    po.push({ date: item.date, value: item.price, type: 'price' });
                    po.push({ date: item.date, value: item.rate, type: 'rate' });
                });
                const so: any = []
                res.data.so.forEach((item: any) => {
                    so.push({ date: item.date, value: item.price, type: 'price' });
                    so.push({ date: item.date, value: item.rate, type: 'rate' });
                });
                setData({ po, so });
            } else {
                setData({ po: [], so: [] });
                message.error(res.msg);
            }
        }).finally(() => {
            setLoading(false);
        });
    };
    const onSearch = (value: string) => {
        asyncFetch(value);
    };
    const config: any = {
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        xAxis: {
            type: 'time',
        },
        slider: {
            start: 0,
            end: 1,
        },
    };
    useEffect(() => {
        asyncFetch('RC-2375');
    }, []);
    return (<>
        <Search placeholder="Please enter SKU" onSearch={onSearch} loading={loading} style={{ width: 200 }} />
        <Spin spinning={loading}>
            <Alert showIcon icon={<LineChartOutlined />} style={{ 'marginTop': '10px', height: '27px' }} message="procurement price" type="success" />
            <Line {...config} data={data.po} />
            <Alert showIcon icon={<LineChartOutlined />} style={{ 'marginTop': '5px', height: '27px' }} message="sales price" type="info" />
            <Line {...config} data={data.so} />
        </Spin>
    </>);
};

export default () => {
    return (<div style={{ 'background': '#fff', padding: '8px' }}>
        <DemoLine />
    </div>)
}