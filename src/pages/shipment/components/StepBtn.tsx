import { Button, message, Modal } from 'antd';
import { useState } from 'react';

const StepBtn = (props: {
  title: string;
  api: any;
  params: any;
  callback: (msg: string) => void;
  ghost?: boolean;
}) => {
  const { title, api, params, callback, ghost } = props;
  const [loading, setLoading] = useState(false);
  const checkProductQuantityShipped = () => {
    const { treeForm, itemDetail } = params;
    let skuObj = {};
    let msg = '';
    itemDetail.forEach((item: any) => {
      if (!skuObj[item.ts_sku]) {
        skuObj[item.ts_sku] = 0;
      }
      skuObj[item.ts_sku] += item.quantityForm;
    });
    let treeFormSkuObj = {};
    treeForm.forEach((item: any) => {
      console.log(item.products.length);
      item.products.forEach((subItem: any) => {
        let sku = subItem.sku;
        console.log(sku);
        if (!treeFormSkuObj[sku]) {
          treeFormSkuObj[sku] = 0;
        }
        treeFormSkuObj[sku] += subItem.quantityShipped;
      });
    });
    //  判断数量是否相等
    let isSame = true;
    for (let key in skuObj) {
      if (skuObj[key] !== treeFormSkuObj[key]) {
        isSame = false;
        msg = `SKU: ${key} quantity is not equal!`;
        break;
      }
    }
    return {
      isSame,
      msg,
    };
  };
  const checkSubmitTransport = () => {
    const { treeForm, carrier } = params;
    let msg = '';
    // 判断treeForm的属性值是否为空
    let isSame = true;
    treeForm.forEach((item: any) => {
      if (
        !item.trackingId ||
        !item.weight_value ||
        !item.weight_unit ||
        !item.dimensions_length ||
        !item.dimensions_width ||
        !item.dimensions_height ||
        !item.dimensions_unit
      ) {
        isSame = false;
        msg = 'Please fill in the required information!';
        return;
      }
    });
    // 判断carrierName是否为空
    if (!carrier) {
      isSame = false;
      msg = 'Please choose a carrier!';
    }
    return {
      isSame,
      msg,
    };
  };
  const processeParams = () => {
    let tempParams: any = {};
    const { shipmentId, carrier, treeForm } = params;
    switch (title) {
      case 'Put transportDetails':
        tempParams = {
          shipment_id: shipmentId,
          carrierName: carrier,
          packages: treeForm.map((item: any, index: number) => {
            return {
              tracking_id: 'deFault0000' + index + 0,
              weight_value: 10,
              weight_unit: 'pounds',
              dimensions_length: 10,
              dimensions_width: 10,
              dimensions_height: 10,
              dimensions_unit: 'inches',
            };
          }),
        };
        break;
      case 'Put cartonContent':
        tempParams = {
          shipment_id: shipmentId,
          items: treeForm.map((item: any) => {
            return {
              cartonId: item.cartonId,
              products: item.products,
            };
          }),
        };
        break;
      case 'Submit transport':
        tempParams = {
          shipment_id: shipmentId,
          carrierName: carrier,
          packages: treeForm.map((item: any) => {
            return {
              tracking_id: item.trackingId,
              weight_value: item.weight_value,
              weight_unit: item.weight_unit,
              dimensions_length: item.dimensions_length,
              dimensions_width: item.dimensions_width,
              dimensions_height: item.dimensions_height,
              dimensions_unit: item.dimensions_unit,
            };
          }),
        };
        break;
      case 'Submit Excel':
        tempParams = {
          shipment_id: shipmentId,
          items: treeForm.map((item: any) => {
            return {
              weight_value: item.weight_value,
              weight_unit: item.weight_unit,
              dimensions_length: item.dimensions_length,
              dimensions_width: item.dimensions_width,
              dimensions_height: item.dimensions_height,
              dimensions_unit: item.dimensions_unit,
            };
          }),
        };
        break;
      case 'Update shipment':
        tempParams = {
          shipment_id: shipmentId,
        };
        break;
      case 'Get transportDetails':
        tempParams = {
          shipment_id: shipmentId,
        };
        break;
      default:
        tempParams = {
          shipment_id: shipmentId,
        };
        break;
    }
    return tempParams;
  };
  const resquestApi = () => {
    if (title === 'Put cartonContent') {
      let result = checkProductQuantityShipped();
      if (!result.isSame) {
        message.error(JSON.stringify(result.msg));
        callback(JSON.stringify(result.msg));
        return;
      }
    }
    if (title === 'Submit transport') {
      let result = checkSubmitTransport();
      if (!result.isSame) {
        message.error(JSON.stringify(result.msg));
        callback(JSON.stringify(result.msg));
        return;
      }
    }
    let params = processeParams();
    setLoading(true);
    api(params).then((res: any) => {
      setLoading(false);
      if (res.code !== 0) {
        message.success(res.msg);
      } else {
        Modal.error({
          title: 'This is an error message',
          content: JSON.stringify(res.msg),
        });
      }
      callback(JSON.stringify(res));
    });
  };
  return (
    <Button
      size="small"
      style={{ marginLeft: '5px', marginTop: '5px' }}
      ghost={ghost}
      type={ghost ? 'primary' : 'default'}
      loading={loading}
      onClick={resquestApi}
    >
      {title}
    </Button>
  );
};

export default StepBtn;
