import styles from '@/styles/modules/shipment.less';
import {
    CaretRightOutlined,
} from '@ant-design/icons';
import {
    Button,
    Collapse,
    Modal,
    Steps,
    Typography,
} from 'antd';
import 'antd/dist/antd.css';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { steps } from '../enumeration';
import type { ListItem } from '@/services/shipment';
import PrintBarCodeModal from './PrintBarCodeModal';
import CreateShipmentPlan from './CreateShipmentPlan';
import PutCartonContentsForm from './PutCartonContentsForm';
const { Step } = Steps;

const { Panel } = Collapse;

const { Text } = Typography;

const CreateShipmentModal = forwardRef((props: { initData?: () => void, shipment_id?: string, addressForm?: any, formData?: any }, ref) => {
    const { shipment_id, addressForm, initData = null } = props;
    const printBarcodeModal: any = useRef();
    const [itemDetail, setItemDetail] = useState<ListItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(0);
    const [resMsg, setResMsg] = useState<string[]>(['', '']);
    const [shipmentId, setShipmentId] = useState(shipment_id); // FBA15D7Y6JQT
    const [treeForm, setFreeForm] = useState<any>([]);
    const [carrierName, setCarrierName] = useState('other');
    const [isEdit, setIsEdit] = useState(false);
    const [shipToAddress, setShipToAddress] = useState<any>({});
    useImperativeHandle(ref, () => ({
        showModal: (params?: any) => {
            const { formData, selectedRowKeys, shipment_id, ship_to_address } = params
            setItemDetail(selectedRowKeys)
            if (shipment_id) {
                const { carrierName, packages } = formData
                setShipmentId(shipment_id)
                setFreeForm(packages || [])
                setCarrierName(carrierName)
                setIsEdit(true)
                setShipToAddress(ship_to_address)
                setCurrent(1)
            }
            setIsModalOpen(true);
        }
    }));
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setShipToAddress({})
        initData && initData()
    };
    const setStepResMsg = (index: number, msg: string) => {
        let newResMsg = [...resMsg];
        newResMsg[index] += msg;
        setResMsg(newResMsg);
    };
    const next = () => {
        setCurrent(current + 1);
    };
    const prev = () => {
        setCurrent(current - 1);
    };
    return (
        <>
            <Modal
                getContainer={false}
                title="Create shipment"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                destroyOnClose
                footer={[,
                    <Button type="primary" disabled={!(current > 0)} key={'Previous'} onClick={() => prev()}>
                        Previous
                    </Button>,
                    <Button
                        type="primary"
                        disabled={!(current < steps.length - 1)}
                        key={'Next'}
                        onClick={() => next()}
                    >
                        Next
                    </Button>,
                ]}
            >
                <Steps current={current}>
                    {steps?.map((item) => (
                        <Step key={item.title} title={<span style={{ fontSize: '12px' }}>{item.title}</span>} />
                    ))}
                </Steps>
                <div className={styles['steps-content']}>
                    {shipmentId ? (
                        <p>
                            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                                ShipmentId: <span style={{ fontSize: '24px' }}>{shipmentId}</span>
                            </h3>
                        </p>
                    ) : null}
                    {(current + 1) === 1 && <CreateShipmentPlan
                        selectedRowKeys={itemDetail}
                        addressInfo={addressForm}
                        setShipmentId={setShipmentId}
                        setStepResMsg={setStepResMsg}
                        isEdit={isEdit} />}
                    {(current + 1) === 2 && <PutCartonContentsForm
                        selectedRowKeys={itemDetail}
                        shipToAddress={shipToAddress}
                        carrierName={carrierName}
                        cartonData={treeForm}
                        shipmentId={shipmentId || ''}
                        setStepResMsg={setStepResMsg} />}
                </div>
                <div className="steps-action">
                    <Collapse
                        defaultActiveKey={['1']}
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    >
                        <Panel header="Response message" key="1" extra={null}>
                            {resMsg[current] ? (
                                <Text code>{resMsg[current]}</Text>
                            ) : (
                                <Text code>no response message</Text>
                            )}
                        </Panel>
                    </Collapse>
                </div>
                <PrintBarCodeModal ref={printBarcodeModal} />
            </Modal>
        </>
    )
});

export default CreateShipmentModal;
