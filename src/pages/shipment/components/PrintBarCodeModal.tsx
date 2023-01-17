import { printBarCodes } from '@/services/shipment';
import { newExportPDF } from '@/utils/utils';
import { Button, Divider, message, Modal, Select, Space, Spin, Typography } from 'antd';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { barCodeSizeGroup } from '../enumeration';
import type { ListItem } from '@/services/shipment';

const { Text } = Typography;

const { Option } = Select;


const PrintBarCodeModal = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [barcodeObj, setBarcodeObj] = useState<any>([]);
    const [barCodeSize, setBarCodeSize] = useState<any>(barCodeSizeGroup[8]);
    const [details, setDetails] = useState<ListItem[]>([]);
    const [printSkus, setPrintSkus] = useState<string[]>([]);
    useImperativeHandle(ref, () => ({
        showModal: (selectedRowKeys: ListItem[]) => {
            setVisible(true);
            setDetails(selectedRowKeys);
            setPrintSkus(selectedRowKeys.map((item: ListItem) => item.ts_sku));
        }
    }));
    const createBarCode = async () => {
        setLoading(true);
        const { width, height } = barCodeSize
        printBarCodes({ skus: printSkus }).then((res) => {
            if (res.code !== 1) {
                message.error(JSON.stringify(res), 10);
                return;
            }
            let tempData = res.data.map((item: any, index: number) => {
                return { fnSku: item.fnSku, barCode: item.barcode, title: item.title, printQuantity: details[index].quantityForm, conditionType: details[index].conditionType };
            });
            setBarcodeObj(tempData);
            newExportPDF('viewBarCode', tempData, { width, height });
            message.success('PrintBarCode success!');
        }).finally(() => {
            setLoading(false);
        });
    };
    const changeSize = (value: any) => {
        const target = barCodeSizeGroup.find((item) => item.title === value);
        setBarCodeSize(target);
    }
    return (<>
        <Modal open={visible} onCancel={() => setVisible(false)} width={640} title='Bar code'>
            <Spin spinning={loading}>
                <Space>
                    <span style={{ 'width': '40px', 'display': 'inline-block' }}>Size:</span>
                    <Select style={{ 'width': '430px' }} defaultValue={'24-up labels 70mm x 40mm on A4'} onChange={changeSize}>
                        {barCodeSizeGroup.map((item) => {
                            return <Option value={item.title}>{item.title}</Option>
                        })}
                    </Select>
                    <Button type='primary' onClick={createBarCode}>Download PDF</Button>
                </Space>
                <Space style={{ 'marginTop': '10px' }}>
                    <span style={{ 'width': '40px', 'display': 'inline-block' }}>Skus:</span>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '430px' }}
                        placeholder="Please select"
                        defaultValue={printSkus}
                        onChange={(skus) => {
                            setPrintSkus(skus);
                        }}
                        options={details.map((item) => {
                            return { label: item.ts_sku, value: item.ts_sku }
                        })}
                    />
                </Space>
                <div id={'viewBarCode'}>
                    {barcodeObj.map((item: any) => {
                        return (<>
                            <Divider />
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <div>
                                    <img src={item.barCode} style={barCodeSize.height < 30 ? { 'height': '100px', 'width': '100%' } : undefined} />
                                </div>
                                <div style={{ fontSize: '30px', margin: '8px 0', fontWeight: '600' }}>
                                    {item.fnSku}
                                </div>
                                <p style={{ fontSize: '26px', fontWeight: '700' }}><Text ellipsis>{item.conditionType + '—' + item.title}</Text></p>
                            </div>
                        </>)
                    })}
                </div>
            </Spin>
        </Modal>
    </>)
});

export default PrintBarCodeModal;