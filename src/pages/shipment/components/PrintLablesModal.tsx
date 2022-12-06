import { getLabels } from '@/services/shipment';
import { createDownload } from '@/utils/utils';
import { Form, message, Modal, Select, Checkbox } from 'antd';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { pageType, labelType } from '../enumeration';
const { Option } = Select;
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};
const PrintLablesModal = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [getLablesFormRef] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [shipmentId, setShipmentId] = useState('');
    const [cartonIds, setCartonIds] = useState<string[]>([]);
    useImperativeHandle(ref, () => ({
        showModal: (cartonIdArray: string[], spid: string) => {
            setVisible(true);
            setShipmentId(spid);
            setCartonIds(cartonIdArray);
        }
    }));
    const getLables = () => {
        getLablesFormRef
            .validateFields()
            .then((values) => {
                let params = {
                    shipment_id: shipmentId,
                    ...values,
                    package_labels_to_print: values.package_labels_to_print.toString(),
                };
                setLoading(true);
                getLabels(params).then((res) => {
                    if (res.code === 0) {
                        message.error(JSON.stringify(res), 10);
                        return;
                    }
                    const { data } = res;
                    const { DownloadURL } = data;
                    createDownload('lables', DownloadURL);
                }).finally(() => {
                    setLoading(false);
                });
            })
            .catch((errorInfo) => {
                message.error(JSON.stringify(errorInfo));
            });
    }
    return (<>
        <Modal
            open={visible}
            okText={'GetLables'}
            confirmLoading={loading}
            onOk={getLables}
            onCancel={() => setVisible(false)}
            width={640}
            title='Get lables'>
            <Form {...layout} form={getLablesFormRef}>
                <Form.Item
                    name="page_type"
                    label="Page type"
                    rules={[{ required: true }]}
                    initialValue={'PackageLabel_Letter_6'}
                >
                    <Select style={{ width: '100%' }}>
                        {pageType.map((item: any) => {
                            return <Option value={item}>{item}</Option>;
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="label_type"
                    label="Label type"
                    rules={[{ required: true }]}
                    initialValue={'UNIQUE'}
                >
                    <Select style={{ width: '100%' }}>
                        {labelType.map((item: any) => {
                            return <Option value={item}>{item}</Option>;
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="package_labels_to_print"
                    label="Package labels to print"
                    rules={[{ required: true }]}
                    initialValue={cartonIds.map((cartonId) => cartonId)}
                >
                    <Checkbox.Group>
                        {cartonIds.map((cartonId: string, index: number) => {
                            return (
                                <Checkbox key={index} value={cartonId}>
                                    {cartonId}
                                </Checkbox>
                            );
                        })}
                    </Checkbox.Group>
                </Form.Item>
            </Form>
        </Modal>
    </>)
});

export default PrintLablesModal;