import { useState } from 'react';
import { Button, Modal } from 'antd';

export default (props: {
    sales_price: number; // 系统销售价
    person_sales_price: number;  // 人工填写的销售价
    us_tax_rate: number; // 关税
    tax_rate: number; // 人工填写的税率
    ship_fee: number; // 运费
    platform_fee: number; // 平台费
    last_purchase_price: number; // 最近一次采购价
    purchase_price: number; // 采购价
    exchange_rate: number; // 汇率
    profitPoint: number; // 利润点
}) => {
    const [visible, setVisible] = useState(false);
    const { sales_price, person_sales_price, us_tax_rate, tax_rate, ship_fee, platform_fee, last_purchase_price, purchase_price, exchange_rate } = props;
    // 采购单价  = (采购价 / 汇率) * (1 + 关税)   如果人工填写了关税，就用人工填写的关税，采购价也是一样
    const unitCost = ((purchase_price ? purchase_price : last_purchase_price) / exchange_rate) * (1 + (tax_rate ? tax_rate : us_tax_rate));
    // target price  (售价 * (1 - 平台费) - 运费) / (1 + 关税)  * （1 - 利润点） * 汇率
    const targetPrice = ((person_sales_price ? person_sales_price : sales_price) * (1 - platform_fee) - ship_fee) / (1 + (tax_rate ? tax_rate : us_tax_rate)) * (1 - props.profitPoint) * exchange_rate;
    // 毛利率 = (售价 * (1 - 平台费) - 运费 - 采购单价) / (售价 * (1 - 平台费))
    const grossMargin = ((person_sales_price ? person_sales_price : sales_price) * (1 - platform_fee) - ship_fee - unitCost) / ((person_sales_price ? person_sales_price : sales_price) * (1 - platform_fee));
    return (
        <div>
            <Button size='small' onClick={() => setVisible(true)}>Calculate</Button>
            <Modal
                open={visible}
                onCancel={() => {
                    setVisible(false);
                }}>
                <div>
                    <h1>TestComputer</h1>
                    {/* 显示基础数值 */}
                    <div>系统销售价：{sales_price}</div>
                    <div>人工填写的销售价：{person_sales_price}</div>
                    <div>关税：{us_tax_rate}</div>
                    <div>人工填写的税率：{tax_rate}</div>
                    <div>运费：{ship_fee}</div>
                    <div>平台费：{platform_fee}</div>
                    <div>最近一次采购价：{last_purchase_price}</div>
                    <div>采购价：{purchase_price}</div>
                    <div>汇率：{exchange_rate}</div>
                    <div>利润点：{props.profitPoint}</div>
                    <div>(售价 * (1 - 平台费))：{(person_sales_price ? person_sales_price : sales_price) * (1 - platform_fee)}</div>
                    {/* 显示计算结果 */}
                    <br />
                    <br />
                    <div>Unit Cost(USD) :{unitCost}</div>
                    <div>Target Purchase Price(CNY)：{targetPrice}</div>
                    <div>Margin Rate：{grossMargin}</div>
                    {/* 显示计算过程 */}
                    <br />
                    <br />
                    <div>Unit Cost(USD) = (采购价 / 汇率) * (1 + 关税)   如果人工填写了关税，就用人工填写的关税，采购价也是一样</div>
                    <div>Target Purchase Price(CNY)  (售价 * (1 - 平台费) - 运费) / (1 + 关税)  * （1 - 利润点） * 汇率</div>
                    <div>Margin Rate = (售价 * (1 - 平台费) - 运费 - 采购单价) / (售价 * (1 - 平台费))</div>
                </div>
            </Modal>
        </div>
    );
}