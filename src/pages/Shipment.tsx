import {
  createShipment,
  createShipmentPlan,
  getLabels,
  getSkuList,
  printBarCode,
  putCartonContents,
  putTransportDetails,
  getFeed,
  updateShipment
} from '@/services/shipment';
import styles from '@/styles/modules/shipment.less';
import { getGlobalParams } from '@/utils/globalParams';
import { getToken } from '@/utils/token';
import { createDownload, exportPDF } from '@/utils/utils';
import {
  BellOutlined,
  CaretRightOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { FormInstance, UploadProps } from 'antd';
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Steps,
  Tabs,
  Typography,
  Upload,
  Tag,
  Result
} from 'antd';
import { useRef, useState } from 'react';
const { Step } = Steps;

const { Panel } = Collapse;

const { Text } = Typography;

const { Option } = Select;

const { Dragger } = Upload;

const { TabPane } = Tabs;

type listItem = {
  asin: string;
  ts_sku: string;
  fnsku: string;
  quantity: number;
  title: string;
  conditionType: string;
  productType: string;
  itemName: string;
  store_id: number;
  store_name: string;
  quantityForm?: number;
  quantityInCaseForm?: number;
  printQuantity?: number;
};

const steps = [
  {
    title: 'CreateShipment',
    step: '1',
  },
  {
    title: 'PutCartonContents',
    step: '2',
  },
  {
    title: 'UpdateShipment',
    step: '3',
  },
];

const pageType = [
  'PackageLabel_Letter_2',
  'PackageLabel_Letter_4',
  'PackageLabel_Letter_6',
  'PackageLabel_Letter_6_CarrierLeft',
  'PackageLabel_A4_2',
  'PackageLabel_A4_4',
  'PackageLabel_Plain_Paper',
  'PackageLabel_Plain_Paper_CarrierBottom',
  'PackageLabel_Thermal',
  'PackageLabel_Thermal_Unified',
  'PackageLabel_Thermal_NonPCP',
  'PackageLabel_Thermal_No_Carrier_Rotation',
];

const labelType = ['BARCODE_2D', 'UNIQUE', 'PALLET'];

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};


const ListTable = () => {
  const actionRef: any = useRef<FormInstance>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<listItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createShipmentformRef] = Form.useForm();
  const [putTransportDetailsFormRef] = Form.useForm();
  const [getLablesFormRef] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [runLoading, setRunLoading] = useState(false);
  const [doneLoading, setDoneLoading] = useState(false);
  const [resMsg, setResMsg] = useState<string[]>(['', '', '', '', '', '']);
  const [shipmentId, setShipmentId] = useState('FBA16Y9K1W65'); // FBA15D7H2CH5   FBA16Y2R0PQK
  const [treeForm, setFreeForm] = useState<any>([]);
  const [itemDetail, setItemDetail] = useState<listItem[]>([]);
  const [barcodeObj, setBarcodeObj] = useState<any>([]);
  const [allParams, setAllParams] = useState<any>({});
  const [tabKey, setTabKey] = useState('1');
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const addCarton = () => {
    let lastItem = treeForm[treeForm.length - 1];
    let cartonId = 'U000001'
    if (lastItem) {
      cartonId = 'U' + String(Number(lastItem.cartonId.slice(1)) + 1).padStart(6, '0');
    }
    // if (lastItem && !lastItem.cartonId) {
    //   message.error('Please fill in the cartonId');
    //   return;
    // }
    setFreeForm([
      ...treeForm,
      { cartonId: cartonId, products: [{ sku: '', quantityShipped: '' }] },
    ]);
  };
  const removeCarton = (index: number) => {
    treeForm.splice(index, 1);
    setFreeForm([...treeForm]);
  };
  const removeProduct = (index: number, index2: number) => {
    if (treeForm[index].products.length === 1) {
      message.error('At least one product');
      return;
    }
    treeForm[index].products.splice(index2, 1);
    setFreeForm([...treeForm]);
  };
  const addProduct = (index: number) => {
    let lastItem = treeForm[index].products[treeForm[index].products.length - 1];
    // 校验lastItem属性值是否都有值
    if (lastItem && (!lastItem.quantityShipped || !lastItem.sku)) {
      message.error('Empty parameters are found. Please fill in the parameter values！');
      return;
    }
    const newTreeForm = [...treeForm];
    newTreeForm[index].products.push({ sku: '', quantityShipped: '' });
    setFreeForm(newTreeForm);
  };
  const changeCartionId = (index: number, value: any) => {
    const newTreeForm = [...treeForm];
    newTreeForm[index].cartonId = value;
    setFreeForm(newTreeForm);
  };
  const changeProductPop = (index: number, index2: number, value: any, key: string) => {
    const newTreeForm = [...treeForm];
    newTreeForm[index].products[index2][key] = value;
    setFreeForm(newTreeForm);
  };
  const checkTreeFormValues = () => {
    let flag = true;
    treeForm.forEach((item: any) => {
      if (!item.cartonId) {
        flag = false;
      }
      item.products.forEach((product: any) => {
        if (!product.quantityShipped || !product.sku) {
          flag = false;
        }
      });
    });
    return flag;
  };
  const toCreateShipment = async (values: any) => {
    setRunLoading(true);
    let msg = '';
    try {
      const res = await createShipmentPlan(values);
      if (res.code != 0) {
        msg = JSON.stringify(res) + '\n';
        const { ShipmentId } = res.data[0];
        const subRes = await createShipment(ShipmentId);
        msg += JSON.stringify(subRes);
        if (subRes.code != 0) {
          setShipmentId(ShipmentId);
          setRunLoading(false);
          message.success('CreateShipment success!');
        } else {
          message.error(JSON.stringify(subRes));
          setRunLoading(false);
        }
      } else {
        setRunLoading(false);
        message.error(JSON.stringify(res));
        msg = JSON.stringify(res);
      }
    } catch (error) {
      message.error(JSON.stringify(error));
      setRunLoading(false);
    }
    setStepResMsg(current, msg);
  };
  const toPutTransportDetails = async (values: any) => {
    setRunLoading(true);
    let msg = '';
    try {
      const res = await putTransportDetails(values);
      if (res.code != 0) {
        msg = JSON.stringify(res);
        setRunLoading(false);
        message.success('PutTransportDetails success!');
      } else {
        setRunLoading(false);
        message.error(JSON.stringify(res));
        msg = JSON.stringify(res);
      }
    } catch (error) {
      message.error(JSON.stringify(error));
      setRunLoading(false);
    }
    setStepResMsg(current, msg);
  };
  const toPutCartonContents = async () => {
    setRunLoading(true);
    let msg = '';
    try {
      let params = { shipment_id: shipmentId, items: treeForm }
      const res = await putCartonContents(params);
      if (res.code != 0) {
        msg = JSON.stringify(res);
        setRunLoading(false);
        message.success('PutCartonContents success!');
        let feedId = res.data.feedId;
        setNewParams('CartonContents', params);
        getFeedResult(feedId);
      } else {
        setRunLoading(false);
        message.error(JSON.stringify(res));
        msg = JSON.stringify(res);
      }
    } catch (error) {
      message.error(JSON.stringify(error));
      setRunLoading(false);
    }
    setStepResMsg(current, msg);
  };
  const setStepResMsg = (index: number, msg: string) => {
    let newResMsg = [...resMsg];
    newResMsg[index] += msg;
    setResMsg(newResMsg);
  };
  const createBarCode = () => {
    setRunLoading(true);
    let promises = itemDetail.map((item) => {
      return printBarCode({ sku: item.ts_sku });
    });
    Promise.all(promises).then((res: any) => {
      let flag = true;
      res.forEach((item: any) => {
        setStepResMsg(current, JSON.stringify(item));
        if (item.code != 1) {
          flag = false;
        }
      });
      if (flag) {
        let tempData = res.map((item: any, index: number) => {
          return { fnSku: item.data.fnSku, barCode: item.data.barcode, title: item.data.title, printQuantity: itemDetail[index].printQuantity };
        });
        setBarcodeObj(tempData);
        exportPDF('viewBarCode', tempData);
        message.success('PrintBarCode success!');
      } else {
        message.error('PrintBarCode fail!');
      }
    }).finally(() => {
      setRunLoading(false);
    });
  };
  const next = () => {
    setCurrent(current + 1);
  };
  const setNewParams = (key: string, values: any) => {
    let newParams = { ...allParams };
    newParams[key] = values;
    setAllParams(newParams);
  }
  const deBugCurrentStepFun = () => {
    switch (current + 1) {
      case 1:
        createShipmentformRef
          .validateFields()
          .then((values) => {
            let tempValues = {
              ...values,
              goods: itemDetail.map(item => {
                return {
                  sellerSKU: item.ts_sku,
                  asin: item.asin,
                  quantity: item.quantityForm,
                  quantityInCase: 1,
                }
              })
            }
            setNewParams('createShipment', tempValues);
            toCreateShipment(tempValues);
          })
          .catch((errorInfo) => {
            console.log(errorInfo);
          });
        break;
      case 2:
        let flag = checkTreeFormValues();
        if (flag) {
          toPutCartonContents();
        } else {
          message.error('Empty parameters are found. Please fill in the parameter values！');
        }
        break;
      case 3:
        createBarCode();
        break;
      case 5:
        getLablesFormRef
          .validateFields()
          .then((values) => {
            setRunLoading(true);
            let params = {
              shipment_id: shipmentId,
              ...values,
              package_labels_to_print: values.package_labels_to_print.toString(),
            };
            setNewParams('getLables', params);
            getLabels(params).then((res) => {
              if (res.code === 0) {
                message.error(JSON.stringify(res));
                setRunLoading(false);
                return;
              }
              const { data } = res;
              const { DownloadURL } = data;
              createDownload('lables', DownloadURL);
              setStepResMsg(current, JSON.stringify(res));
              setRunLoading(false);
            });
          })
          .catch((errorInfo) => {
            message.error(JSON.stringify(errorInfo));
            setStepResMsg(current, JSON.stringify(errorInfo));
            setRunLoading(false);
          });
        break;
      case 6:
        putTransportDetailsFormRef
          .validateFields()
          .then((values) => {
            const params = {
              shipment_id: shipmentId,
              ...values,
            };
            setNewParams('putTransportDetails', params);
            toPutTransportDetails(params);
          })
          .catch((errorInfo) => {
            console.log(errorInfo);
          });
        break;
      case 7:
        updateShipmentDone();
        break;
    }
  };
  const fileProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'http://api-rp.itmars.net/shipment/updatePackageByFile',
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
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        const res = info.file.response;
        if (res.code === 0) {
          message.error(JSON.stringify(res));
        } else {
          let feedId = res.data.feedId;
          getFeedResult(feedId);
          message.success(`${info.file.name} file uploaded successfully`);
        }
        setStepResMsg(current, JSON.stringify(info.file.response));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const getFeedResult = async (feedId: string) => {
    getFeed({ feed_id: feedId }).then((res) => {
      if (res.code === 0) {
        message.error(JSON.stringify(res));
        setStepResMsg(current, JSON.stringify(res));
        return;
      }
      setStepResMsg(current, JSON.stringify(res));
      setRunLoading(false);
    });
  }

  const updateShipmentDone = () => {
    setDoneLoading(true);
    updateShipment({ shipment_id: shipmentId }).then((res) => {
      if (res.code !== 1) {
        message.error(JSON.stringify(res));
        return;
      } else {
        message.success('UpdateShipment success!');
      }
      setStepResMsg(current, JSON.stringify(res));
    }).finally(() => {
      setDoneLoading(false);
    }).catch((error) => {
      message.error(JSON.stringify(error));
      setStepResMsg(current, JSON.stringify(error));
    });
  }

  const prev = () => {
    setCurrent(current - 1);
  };
  const createShipmentForm: any = (
    <>
      <Form {...layout} form={createShipmentformRef}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="addressLine1" label="AddressLine1" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="addressLine2" label="AddressLine2" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="districtOrCounty" label="DistrictOrCounty" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="stateOrProvinceCode"
          label="StateOrProvinceCode"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="countryCode" label="CountryCode" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="postalCode" label="PostalCode" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Divider />
        <Form.List name="goods">
          {(fields, { add, remove }) => {
            return (
              <>
                {itemDetail.map((field, name) => (<>
                  <Space
                    key={field.ts_sku + name}
                    style={{ width: '1550px', 'marginBottom': '-14px' }}
                    align="center"
                    size={15}
                  >
                    <span style={{ 'marginLeft': '125px' }}>Sku:</span><Input style={{ 'width': '100px' }} value={field.ts_sku} />
                    <span>asin:</span><Input value={field.asin} style={{ 'width': '100px' }} />
                    <span>Quantity:</span><InputNumber value={field.quantityForm} onChange={(val) => {
                      let newDetail: any = [...itemDetail];
                      newDetail[name].quantityForm = val;
                      setItemDetail(newDetail);
                    }} />
                  </Space>
                  <div style={{ 'padding': '0 16px 0 16px', 'marginBottom': '10px', marginTop: '15px' }}>
                    {field.fnsku && (<Tag color="#2db7f5">{field.fnsku}</Tag>)}
                    {field.conditionType && (<Tag color="#87d068">{field.conditionType}</Tag>)}
                    {field.productType && (<Tag color="#108ee9">{field.productType}</Tag>)}
                    {field.itemName && (<span title={field.itemName} style={{ 'background': '#f9f0ff', 'color': '#991dbe', 'border': '.5px solid #d3adf7' }}>{field.itemName}</span>)}
                  </div>
                </>))}
              </>
            )
          }}
        </Form.List>
      </Form>
    </>
  );
  const putTransportDetailsForm: any = (
    <>
      <Form {...layout} form={putTransportDetailsFormRef}>
        <Form.List name="packages">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, name, ...restField) => {
                return (
                  <>
                    <Divider />
                    <Form.Item
                      {...restField}
                      label="Tracking id"
                      name={[name, 'tracking_id']}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Dimensions length"
                      name={[name, 'dimensions_length']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Dimensions width"
                      name={[name, 'dimensions_width']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber placeholder="width" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Dimensions height"
                      name={[name, 'dimensions_height']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber placeholder="Height" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Dimensions unit"
                      name={[name, 'dimensions_unit']}
                      rules={[{ required: true }]}
                      initialValue={'inches'}
                    >
                      <Select allowClear>
                        <Option value="inches">inches</Option>
                        <Option value="other">other</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Weight"
                      name={[name, 'weight_value']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber placeholder="weight" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Weight unit"
                      name={[name, 'weight_unit']}
                      rules={[{ required: true }]}
                      initialValue={'pounds'}
                    >
                      <Select allowClear>
                        <Option value="pounds">pounds</Option>
                        <Option value="other">other</Option>
                      </Select>
                    </Form.Item>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <Button
                        danger
                        onClick={() => {
                          remove(field.name);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                );
              })}
              <Form.Item label={' '} colon={false}>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Transport Details
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
  const putCartonContentsForm: any = (
    <>
      <Tabs style={{ paddingLeft: '12px' }} defaultActiveKey={tabKey} onChange={(key) => {
        setTabKey(key);
      }}>
        <TabPane tab="Form" key="1" />
        <TabPane tab="Excel" key="2" />
      </Tabs>
      {tabKey === '1' && (<>
        {treeForm.map((item: any, index: number) => {
          return (<>
            {index !== 0 && <Divider />}
            <span style={{ 'position': 'absolute', 'left': '40px', 'color': '#bdb5b5', 'fontSize': '26px' }}>{item.cartonId}</span>
            <div style={{ marginTop: index > 0 ? 10 : 0, paddingLeft: '100px' }}>
              <Space>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Tracking ID ：</span>
                <Input
                  value={item.cartonId}
                  onChange={(e) => {
                    const value = e.target.value;
                    changeCartionId(index, value);
                  }}
                />
                <Button icon={<PlusOutlined />} block onClick={() => addProduct(index)}>
                  Add product
                </Button>
                <MinusCircleOutlined
                  onClick={() => {
                    removeCarton(index);
                  }}
                />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Weight ：</span>
                <InputNumber />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Weight unit ：</span>
                <InputNumber />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions length ：</span>
                <InputNumber />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions width ：</span>
                <InputNumber />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions height ：</span>
                <InputNumber />
              </Space>
              <Space style={{ 'marginTop': '10px' }}>
                <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions unit ：</span>
                <Select allowClear style={{ 'width': '88px' }} defaultValue={'inches'}>
                  <Option value="inches">inches</Option>
                  <Option value="other">other</Option>
                </Select>
              </Space>
              <div style={{ marginTop: '20px' }}>
                {item.products.map((product: any, productIndex: number) => {
                  return (
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
                      <MinusCircleOutlined
                        onClick={() => {
                          removeProduct(index, productIndex);
                        }}
                      />
                    </Space>
                  );
                })}
              </div>
            </div>
          </>);
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
        </div></>)}
      {tabKey === '2' && (<>
        <Space style={{ 'marginBottom': '10px' }}>
          <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right', marginLeft: '100px' }}>Carton numbers</span>
          <Input.Group compact>
            <InputNumber style={{ 'width': '140px' }} />
            <Button type="primary">Download</Button>
          </Input.Group>
        </Space>
        <Dragger {...fileProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibit from uploading company data or
            other band files
          </p>
        </Dragger></>)}
    </>
  );
  const updatePackageByFileForm: any = (
    <>
      <Dragger {...fileProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading company data or
          other band files
        </p>
      </Dragger>
    </>
  );
  const printpackingListForm: any = (
    <div style={{ 'textAlign': 'center' }}>
      {itemDetail.map((item, index) => {
        return (
          <div style={{ 'margin': '10px' }}>
            <span>sku: </span>
            <Input style={{ 'width': '100px' }} value={item.ts_sku} />
            <span style={{ 'marginLeft': '20px' }}>printing quantity: </span>
            <InputNumber
              value={item.printQuantity}
              onChange={(value) => {
                let newDetail = [...itemDetail];
                newDetail[index].printQuantity = value;
                setItemDetail(newDetail);
              }} />
          </div>
        )
      })}
      <div id={'viewBarCode'}>
        {barcodeObj.map((item: any) => {
          return (<><Divider />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div>
                <img src={item.barCode} />
              </div>
              <div style={{ fontSize: '30px', margin: '8px 0', fontWeight: '600' }}>
                {item.fnSku}
              </div>
              <p style={{ fontSize: '26px', fontWeight: '700' }}>{item.title}</p>
            </div>
          </>)
        })}
      </div>
    </div>
  );
  const getLablesForm: any = (
    <>
      <Form {...layout} form={getLablesFormRef}>
        <Form.Item
          name="page_type"
          label="Page type"
          rules={[{ required: true }]}
          initialValue={'PackageLabel_A4_4'}
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
          initialValue={[...treeForm.map((item: any) => item.cartonId)]}
        >
          <Checkbox.Group>
            {treeForm.map((item: any, index: number) => {
              return (
                <Checkbox key={index} value={item.cartonId}>
                  {item.cartonId}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </>
  );
  const UpdateShipmentForm: any = (<>
    {!resMsg[current] ? (<Result
      title="the final step!"
      subTitle="After all steps are complete, please change the delivery status."
      extra={[
        <Button key="buy" onClick={() => setCurrent(0)}>Restart</Button>,
      ]}
    />) : (<Result
      status="success"
      title="successfully!"
      extra={[
        <Button key="buy" onClick={() => setCurrent(0)}>Restart</Button>,
      ]}
    />)}
  </>)
  const columns: ProColumns<listItem>[] = [
    {
      title: 'fn_sku',
      dataIndex: 'fnsku',
    },
    {
      title: 'conditionType',
      search: false,
      dataIndex: 'conditionType',
    },
    {
      title: 'Sku',
      dataIndex: 'vendor_sku',
      hideInTable: true,
    },
    {
      title: 'asin',
      dataIndex: 'asin',
    },
    {
      title: 'productType',
      dataIndex: 'productType',
    },
    {
      title: 'store_name',
      dataIndex: 'store_name',
    },
  ];
  return (
    <>
      <ProTable<listItem>
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRowKeys(selectedRows);
            setItemDetail(selectedRows);
          },
          selectedRowKeys: selectedRowKeys.map((item) => item.ts_sku),
          preserveSelectedRowKeys: true,
        }}
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}, sort, filter) => {
          const { data, code } = await getSkuList({
            ...params,
            page: params.current,
            len: params.pageSize,
          });
          return {
            data: data.data,
            success: !!code,
            total: data.total,
          };
        }}
        rowKey="ts_sku"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="List"
        toolBarRender={() => [
          <Button disabled={!selectedRowKeys.length} key="3" type="primary" onClick={showModal}>
            Create shipment
          </Button>,
        ]}
      />
      <Modal
        title="Create shipment"
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        destroyOnClose
        footer={[
          <Button key="back" style={{ 'display': current === 0 ? 'inline-block' : 'none' }} onClick={handleCancel}>PrintpackingList</Button>,
          <Button key="back" style={{ 'display': current === 1 ? 'inline-block' : 'none' }} onClick={handleCancel}>GetLables</Button>,
          <Button
            key="back"
            type="primary"
            onClick={deBugCurrentStepFun}
            icon={<CaretRightOutlined />}
            loading={runLoading}
          >
            Run
          </Button>,
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
          <Button
            type="primary"
            disabled={!(current === steps.length - 1)}
            key={'Done'}
            loading={doneLoading}
            onClick={() => updateShipmentDone()}
          >
            Done
          </Button>,
        ]}
      >
        <Steps current={current}>
          {steps.map((item) => (
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
          {steps[current].step === '1' && <div>{createShipmentForm}</div>}
          {steps[current].step === '2' && <div>{putCartonContentsForm}</div>}
          {steps[current].step === '3' && <div>{UpdateShipmentForm}</div>}
        </div>
        <div className="steps-action">
          <Collapse
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          >
            <Panel header="Response message" key="1">
              {resMsg[current] ? (
                <Text code>{resMsg[current]}</Text>
              ) : (
                <Text code>no response message</Text>
              )}
            </Panel>
          </Collapse>
        </div>
      </Modal>
    </>
  );
};

const App: React.FC = () => (
  <div style={{ background: '#fff', padding: '8px' }}>
    <Tabs style={{ paddingLeft: '12px' }} defaultActiveKey={'1'}>
      <TabPane
        tab={
          <span>
            <UnorderedListOutlined />
            List
          </span>
        }
        key="1"
      >
        <ListTable />
      </TabPane>
      <TabPane
        tab={
          <span>
            <BellOutlined />
            Logs
          </span>
        }
        key="2"
      >
        Logs
      </TabPane>
    </Tabs>
  </div>
);

export default App;
