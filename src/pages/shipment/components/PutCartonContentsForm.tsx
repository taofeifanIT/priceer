import type { ListItem } from '@/services/shipment';
import {
  confirmTransport,
  downloadTemplate,
  estimateTransport,
  getShipment,
  getTrackingdetail,
  putCartonContents,
  putTransportDetails,
  saveInRealTime,
  updatePackage,
  updateShipment,
} from '@/services/shipment';
import { getCountry, getGlobalParams } from '@/utils/globalParams';
import { getToken } from '@/utils/token';
import { createDownload } from '@/utils/utils';
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  Button,
  Divider,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  Tabs,
  Tag,
  Upload,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { carrierNameGroup } from '../enumeration';
import PrintLablesModal from './PrintLablesModal';
import StepBtn from './StepBtn';

const { Option } = Select;
const { Dragger } = Upload;
const { TabPane } = Tabs;

interface PutCartonContentsFormProps {
  shipToAddress: any;
  carrierName: string;
  cartonData: any[];
  selectedRowKeys: ListItem[];
  shipmentId: string;
  setStepResMsg: (current: number, msg: string) => void;
}

const PutCartonContentsForm = (props: PutCartonContentsFormProps) => {
  const {
    shipToAddress,
    carrierName = 'other',
    cartonData,
    selectedRowKeys,
    shipmentId,
    setStepResMsg,
  } = props;
  const [carrier, setCarrier] = useState(carrierName);
  const [treeForm, setTreeForm] = useState<any[]>([...cartonData]);
  const [itemDetail] = useState<ListItem[]>([...selectedRowKeys]);
  const printLablesModal: any = useRef();
  const [carton_number, setCarton_number] = useState<number>(cartonData.length);
  const [amount, setAmount] = useState<{
    CurrencyCode: string;
    Value: number;
  }>({ CurrencyCode: '', Value: 0 });
  const timerRef: any = useRef(-1);
  const addCarton = () => {
    let lastItem = treeForm[treeForm.length - 1];
    let cartonId = 'U000001';
    if (lastItem) {
      cartonId = 'U' + String(Number(lastItem.cartonId.slice(1)) + 1).padStart(6, '0');
    }
    const country = getCountry();
    setTreeForm([
      ...treeForm,
      {
        trackingId: '',
        weight_value: '',
        weight_unit: country === 'US' ? 'pounds' : 'kilograms',
        dimensions_length: '',
        dimensions_width: '',
        dimensions_height: '',
        dimensions_unit: country === 'US' ? 'inches' : 'centimeters',
        cartonId: cartonId,
        products: [{ sku: '', quantityShipped: '', quantityInCase: 1, fnSku: '' }],
      },
    ]);
  };
  const removeCarton = (index: number) => {
    treeForm.splice(index, 1);
    setTreeForm([...treeForm]);
  };
  const removeProduct = (index: number, index2: number) => {
    if (treeForm[index].products.length === 1) {
      message.error('At least one product');
      return;
    }
    treeForm[index].products.splice(index2, 1);
    setTreeForm([...treeForm]);
  };
  const addProduct = (index: number) => {
    let lastItem = treeForm[index].products[treeForm[index].products.length - 1];
    // 校验lastItem属性值是否都有值
    if (lastItem && (!lastItem.quantityShipped || !lastItem.sku)) {
      message.error('Empty parameters are found. Please fill in the parameter values！');
      return;
    }
    const newTreeForm = [...treeForm];
    newTreeForm[index].products.push({
      sku: '',
      quantityShipped: '',
      quantityInCase: 1,
      fnSku: '',
    });
    setTreeForm(newTreeForm);
  };
  const changeFreeFormPop = (index: number, key: string, value: any) => {
    const newTreeForm = [...treeForm];
    newTreeForm[index][key] = value;
    setTreeForm(newTreeForm);
  };
  const changeProductPop = (index: number, index2: number, value: any, key: string) => {
    const newTreeForm = [...treeForm];
    newTreeForm[index].products[index2][key] = value;
    if (key === 'sku') {
      const item = itemDetail.find((item) => item.ts_sku === value);
      if (item) {
        newTreeForm[index].products[index2].fnSku = item.fnsku;
      }
    }
    setTreeForm(newTreeForm);
  };
  const fileProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://api-rp.itmars.net/shipment/submitDataByFile',
    maxCount: 1,
    data: {
      shipment_id: shipmentId,
      store_id: getGlobalParams()['store_id'],
    },
    headers: {
      authorization: 'authorization-text',
      token: getToken() as any,
    },
    onChange(info) {
      // if (info.file.status !== 'uploading') {
      //     console.log(info.file, info.fileList);
      // }
      if (info.file.status === 'done') {
        const res = info.file.response;
        if (res.code === 0) {
          message.error(JSON.stringify(res));
        } else {
          message.success(`${info.file.name} file uploaded successfully`);
          const { data, CarrierName } = info.file.response.data;
          setCarrier(CarrierName);
          setTreeForm(data);
        }
        setStepResMsg(1, JSON.stringify(info.file.response));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const downLoadTemplateFn = () => {
    downloadTemplate({ shipment_id: shipmentId, carton_number: carton_number }).then((res) => {
      if (res.code) {
        const { data } = res;
        createDownload('template.xlsx', data);
      } else {
        message.error(res.msg);
      }
    });
  };
  const saveParams = () => {
    let tempValues = {
      shipment_id: shipmentId,
      carrierName: carrier,
      items: treeForm,
    };
    saveInRealTime(tempValues).then((res) => {
      if (res.code == 0) {
        message.error(JSON.stringify(res));
      }
    });
  };
  const btnGroup = (
    <div style={{ marginBottom: '10px' }}>
      <StepBtn
        title="Put transportDetails"
        api={putTransportDetails}
        params={{ shipmentId, carrier, treeForm }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
      <StepBtn
        title="Put cartonContent"
        api={putCartonContents}
        params={{ shipmentId, carrier, treeForm, itemDetail }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
      <Button
        size="small"
        style={{ background: '#a1a0a0', color: '#fff', marginLeft: '5px', marginTop: '5px' }}
        icon={<PrinterOutlined />}
        onClick={() => {
          printLablesModal.current?.showModal(
            treeForm.map((item: any) => item.cartonId),
            shipmentId,
          );
        }}
      >
        Print labels
      </Button>
      <StepBtn
        title="Submit transport"
        api={putTransportDetails}
        params={{ shipmentId, carrier, treeForm }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
      {carrier === 'Amazon partnered' && (
        <>
          <StepBtn
            title="Estimate transport"
            api={estimateTransport}
            params={{ shipmentId }}
            ghost
            callback={(msg) => {
              setStepResMsg(1, msg);
            }}
          />
          <StepBtn
            title="Confirm transport"
            api={confirmTransport}
            params={{ shipmentId }}
            ghost
            callback={(msg) => {
              setStepResMsg(1, msg);
            }}
          />
          <StepBtn
            title="Get trackingdetail"
            api={getTrackingdetail}
            params={{ shipmentId }}
            ghost
            callback={(msg) => {
              const { data } = JSON.parse(msg);
              try {
                setAmount(
                  data.TransportContent.TransportDetails.PartneredSmallParcelData.PartneredEstimate
                    .Amount,
                );
              } catch (error) {
                setStepResMsg(1, JSON.stringify(error));
              }
              setStepResMsg(1, msg);
            }}
          />
        </>
      )}
      <StepBtn
        title="Submit Excel"
        api={updatePackage}
        params={{ shipmentId, carrier, treeForm }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
      <StepBtn
        title="Update shipment"
        api={updateShipment}
        params={{ shipmentId, carrier, treeForm }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
      <StepBtn
        title="Get transportDetails"
        api={getTrackingdetail}
        params={{ shipmentId }}
        callback={(msg) => {
          const { data } = JSON.parse(msg);
          try {
            setAmount(
              data.TransportContent.TransportDetails.PartneredSmallParcelData.PartneredEstimate
                .Amount,
            );
          } catch (error) {
            setStepResMsg(1, JSON.stringify(error));
          }
          setStepResMsg(1, msg);
        }}
      />
      <StepBtn
        title="Get shipment"
        api={getShipment}
        params={{ shipmentId }}
        callback={(msg) => {
          setStepResMsg(1, msg);
        }}
      />
    </div>
  );
  const shipToAddressTable = (
    <div style={{ textAlign: 'center' }}>
      <div style={{ textAlign: 'left', display: 'inline-block', fontWeight: '700' }}>
        <p>{shipToAddress['Name']}</p>
        <p>{shipToAddress['AddressLine1'] + (shipToAddress['AddressLine2'] || '')}</p>
        <p>
          {shipToAddress['City'] +
            ',' +
            shipToAddress['StateOrProvinceCode'] +
            ' ' +
            shipToAddress['PostalCode']}
        </p>
        <p>{shipToAddress['CountryCode'] + `(${shipToAddress['center_id']})`}</p>
      </div>
      <Divider />
    </div>
  );
  const ShowAmount = () => {
    if (carrier === 'Amazon partnered' && amount.CurrencyCode) {
      return (
        <div style={{ textAlign: 'center', margin: '12 5' }}>
          <h2>{amount.CurrencyCode + ' ' + amount.Value}</h2>
        </div>
      );
    }
    return null;
  };
  useEffect(() => {
    if (treeForm.length > 0 && shipmentId) {
      timerRef.current = setInterval(() => {
        saveParams();
      }, 1000 * 30);
    } else {
      clearInterval(timerRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [treeForm, carrier]);
  return (
    <>
      <Tabs defaultActiveKey={treeForm.length > 20 ? '2' : '1'}>
        <TabPane tab={<span style={{ marginLeft: '30px' }}>Form</span>} key="1">
          <>
            {shipToAddress !== '{}' && JSON.stringify(shipToAddress) !== '{}' && shipToAddressTable}
            <Space style={{ marginBottom: '10px', paddingLeft: '138px' }}>
              <span>Carrier name ：</span>
              <Select style={{ width: '273px' }} value={carrier} onChange={setCarrier}>
                {carrierNameGroup.map((item) => {
                  return <Select.Option value={item}>{item}</Select.Option>;
                })}
              </Select>
            </Space>
            <Divider />
            {treeForm.map((item: any, index: number) => {
              return (
                <>
                  {index !== 0 && <Divider />}
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      color: '#bdb5b5',
                      fontSize: '26px',
                    }}
                  >
                    {item.cartonId}
                  </span>
                  <div style={{ marginTop: index > 0 ? 10 : 0, paddingLeft: '100px' }}>
                    <Space>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Tracking ID ：
                      </span>
                      <Input
                        value={item.trackingId}
                        style={{ width: '273px' }}
                        onChange={(e) => {
                          const value = e.target.value;
                          changeFreeFormPop(index, 'trackingId', value);
                        }}
                      />
                      <Popconfirm
                        title="Are you sure delete this carton?"
                        onConfirm={() => removeCarton(index)}
                      >
                        <MinusCircleOutlined />
                      </Popconfirm>
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Weight ：
                      </span>
                      <InputNumber
                        value={item.weight_value}
                        onChange={(val) => changeFreeFormPop(index, 'weight_value', val)}
                      />
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Weight unit ：
                      </span>
                      <Select
                        value={item.weight_unit}
                        allowClear
                        style={{ width: '88px' }}
                        defaultValue={'pounds'}
                        onChange={(val) => changeFreeFormPop(index, 'weight_unit', val)}
                      >
                        <Option value="pounds">pounds</Option>
                        <Option value="other">kilograms</Option>
                      </Select>
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Dimensions length ：
                      </span>
                      <InputNumber
                        value={item.dimensions_length}
                        onChange={(val) => changeFreeFormPop(index, 'dimensions_length', val)}
                      />
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Dimensions width ：
                      </span>
                      <InputNumber
                        value={item.dimensions_width}
                        onChange={(val) => changeFreeFormPop(index, 'dimensions_width', val)}
                      />
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Dimensions height ：
                      </span>
                      <InputNumber
                        value={item.dimensions_height}
                        onChange={(val) => changeFreeFormPop(index, 'dimensions_height', val)}
                      />
                    </Space>
                    <Space style={{ marginTop: '10px' }}>
                      <span style={{ display: 'inline-block', width: '135px', textAlign: 'right' }}>
                        Dimensions unit ：
                      </span>
                      <Select
                        value={item.dimensions_unit}
                        allowClear
                        style={{ width: '88px' }}
                        defaultValue={'inches'}
                        onChange={(val) => changeFreeFormPop(index, 'dimensions_unit', val)}
                      >
                        <Option value="inches">inches</Option>
                        <Option value="other">centimeters</Option>
                      </Select>
                    </Space>
                    <div style={{ marginTop: '20px' }}>
                      {item.products.map((product: any, productIndex: number) => {
                        return (
                          <>
                            <Space style={{ marginTop: productIndex > 0 ? 10 : 0, width: '600px' }}>
                              <span style={{ marginLeft: '10px' }}>Sku ：</span>
                              <Select
                                style={{ width: '120px' }}
                                value={product.sku}
                                onChange={(value) => {
                                  changeProductPop(index, productIndex, value, 'sku');
                                }}
                              >
                                {selectedRowKeys.map(({ ts_sku }) => {
                                  return <Option value={ts_sku}>{ts_sku}</Option>;
                                })}
                              </Select>
                              <span>quantityShipped ：</span>
                              <InputNumber
                                style={{ width: '65px' }}
                                value={product.quantityShipped}
                                onChange={(value) => {
                                  changeProductPop(index, productIndex, value, 'quantityShipped');
                                }}
                              />
                              {productIndex === 0 && (
                                <PlusCircleOutlined onClick={() => addProduct(index)} />
                              )}
                              <Popconfirm
                                title="Are you sure delete this product?"
                                onConfirm={() => removeProduct(index, productIndex)}
                              >
                                <MinusCircleOutlined />
                              </Popconfirm>
                              {product.fnSku && (
                                <Tag style={{ marginLeft: productIndex > 0 ? '22px' : '0' }}>
                                  {product.fnSku}
                                </Tag>
                              )}
                            </Space>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Button
                block
                icon={<PlusOutlined />}
                type="dashed"
                style={{ width: '740px', marginBottom: '10px' }}
                onClick={() => addCarton()}
              >
                add carton
              </Button>
            </div>
            {btnGroup}
            <ShowAmount />
          </>
        </TabPane>
        <TabPane tab="Excel" key="2">
          <>
            {shipToAddress !== '{}' && JSON.stringify(shipToAddress) !== '{}' && shipToAddressTable}
            <Space style={{ marginBottom: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '135px',
                  textAlign: 'right',
                  marginLeft: '140px',
                }}
              >
                Carton numbers
              </span>
              <Input.Group compact>
                <InputNumber
                  style={{ width: '140px' }}
                  value={carton_number}
                  onChange={(val: any) => setCarton_number(val)}
                />
                <Button type="primary" onClick={downLoadTemplateFn}>
                  Download
                </Button>
              </Input.Group>
            </Space>
            {btnGroup}
            <Dragger {...fileProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data
                or other band files
              </p>
            </Dragger>
            <ShowAmount />
          </>
        </TabPane>
      </Tabs>
      <PrintLablesModal ref={printLablesModal} />
    </>
  );
};

export default PutCartonContentsForm;
