import { useState, useEffect } from 'react';
import { Input, message, Spin, Space } from 'antd';
import { getBusinessUnitDataList } from '@/services/businessUnitData/purchasingSalesHistory';
import { G2, Line } from '@ant-design/plots';
import { getQueryVariable } from '@/utils/utils'
const { Search } = Input;


const DemoLine = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sku, setSku] = useState(getQueryVariable('sku') || 'RC-2375');
    const getPoint = (maxValue: number) => {
        G2.registerShape('point', 'breath-point', {
            draw(cfg, container) {
                const chatData: any = cfg.data;
                const point = {
                    x: cfg.x,
                    y: cfg.y,
                };
                const group = container.addGroup();

                if (chatData.value === maxValue) {
                    const decorator1 = group.addShape('circle', {
                        attrs: {
                            x: point.x,
                            y: point.y,
                            r: 10,
                            fill: cfg.color,
                            opacity: 0.5,
                        },
                    });
                    const decorator2 = group.addShape('circle', {
                        attrs: {
                            x: point.x,
                            y: point.y,
                            r: 10,
                            fill: cfg.color,
                            opacity: 0.5,
                        },
                    });
                    const decorator3 = group.addShape('circle', {
                        attrs: {
                            x: point.x,
                            y: point.y,
                            r: 10,
                            fill: cfg.color,
                            opacity: 0.5,
                        },
                    });
                    decorator1.animate(
                        {
                            r: 20,
                            opacity: 0,
                        },
                        {
                            duration: 1800,
                            easing: 'easeLinear',
                            repeat: true,
                        },
                    );
                    decorator2.animate(
                        {
                            r: 20,
                            opacity: 0,
                        },
                        {
                            duration: 1800,
                            easing: 'easeLinear',
                            repeat: true,
                            delay: 600,
                        },
                    );
                    decorator3.animate(
                        {
                            r: 20,
                            opacity: 0,
                        },
                        {
                            duration: 1800,
                            easing: 'easeLinear',
                            repeat: true,
                            delay: 1200,
                        },
                    );
                    group.addShape('circle', {
                        attrs: {
                            x: point.x,
                            y: point.y,
                            r: 6,
                            fill: cfg.color,
                            opacity: 0.7,
                        },
                    });
                    group.addShape('circle', {
                        attrs: {
                            x: point.x,
                            y: point.y,
                            r: 1.5,
                            fill: cfg.color,
                        },
                    });
                }

                return group;
            },
        });
    }
    const asyncFetch = (searchValue: string) => {
        setLoading(true);
        getBusinessUnitDataList({ sku: searchValue }).then((res) => {
            if (res.code) {
                const tempData: any = [];
                res.data.forEach((item: any) => {
                    if (item.purchasePrice) {
                        tempData.push({ date: item.current_date, value: parseFloat(item.purchasePrice), type: 'purchasePrice' });
                    }
                    if (item.rate) {
                        tempData.push({ date: item.current_date, value: parseFloat(item.rate), type: 'rate' });
                    }
                    // 把采购价换算成人民币 CNY
                    // if (item.purchasePrice && item.rate) {
                    //     tempData.push({ date: item.current_date, value: (parseFloat(item.purchasePrice) * parseFloat(item.rate)).toFixed(2), type: 'purchasePrice(CNY)' });
                    // }
                    if (item.salePrice) {
                        tempData.push({ date: item.current_date, value: parseFloat(item.salePrice), type: 'salePrice' });
                    }
                })
                setData(tempData);
                getPoint(Math.max(...tempData.map((item: any) => item.value)))
            } else {
                setData([]);
                message.error(res.msg);
            }
        }).finally(() => {
            setLoading(false);
        });
    };
    const onSearch = (value: string) => {
        asyncFetch(value);
    };
    const onSearchChange = (e: any) => {
        setSku(e.target.value);
    }
    const config: any = {
        autoFit: true,
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        xAxis: {
            type: 'time',
        },
        color: ['#5B8FF9', '#F6BD16', '#5AD8A6', '#E76C5E'],
        slider: {
            start: 0,
            end: 1,
        },
        point: { shape: 'breath-point' },
        style: {
            height: document.body.clientHeight - 200
        },
        smooth: true,
    };
    useEffect(() => {
        asyncFetch(sku);
    }, []);
    return (<>
        <Space>SKU: <Search placeholder="Please enter SKU" onSearch={onSearch} value={sku} onChange={onSearchChange} loading={loading} style={{ width: 200 }} /></Space>
        <Spin spinning={loading}>
            <Line {...config} data={data} />
        </Spin>
    </>);
};

export default () => {
    return (<div style={{ 'background': '#fff', padding: '8px' }}>
        <DemoLine />
    </div>)
}