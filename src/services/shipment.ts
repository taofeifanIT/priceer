import { request } from 'umi';

export async function getSkuList(params: any) {
  return request('/api/shipment/getSkuList', {
    method: 'POST',
    data: params,
  });
}
// shipment/createShipmentPlan
export async function createShipmentPlan(params: any) {
  return request('/api/shipment/createShipmentPlan', {
    method: 'POST',
    data: params,
  });
}

// shipment/createShipment
export async function createShipment(shipmentPlanId: string) {
  return request('/api/shipment/createShipment', {
    method: 'POST',
    data: { shipment_id: shipmentPlanId },
  });
}

// putTransportDetails
export async function putTransportDetails(params: any) {
  return request('/api/shipment/putTransportDetails', {
    method: 'POST',
    data: params,
  });
}

// shipment/putCartonContents
export async function putCartonContents(params: any) {
  return request('/api/shipment/putCartonContents', {
    method: 'POST',
    data: params,
    timeout: 1000 * 60 * 5,
  });
}

// shipment/updatePackageByFile upload file
export async function updatePackageByFile(params: { shipment_id: string; file: any }) {
  return request('/api/shipment/updatePackageByFile', {
    method: 'POST',
    data: params,
    requestType: 'form',
    timeout: 1000 * 60 * 5,
  });
}

// shipment/getFeed
export async function getFeed(params: { feed_id: string }) {
  return request('/api/shipment/getFeed', {
    method: 'POST',
    data: params,
  });
}
// shipment/printBarCode
export async function printBarCode(params: { sku: string }) {
  return request('/api/shipment/printBarCode', {
    method: 'POST',
    data: params,
  });
}
// shipment/getLabels
export async function getLabels(params: {
  shipment_id: string;
  page_type: string;
  label_type: string;
  package_labels_to_print: string;
}) {
  return request('/api/shipment/getLabels', {
    method: 'POST',
    data: params,
  });
}

// updateShipment
export async function updateShipment(params: { shipment_id: string }) {
  return request('/api/shipment/updateShipment', {
    method: 'POST',
    data: params,
  });
}


//  shipment/submitDataByForm
export async function submitDataByForm(params: any) {
  return request('/api/shipment/submitDataByForm', {
    method: 'POST',
    data: params,
  });
}

// shipment/updatePackage
export async function updatePackage(params: any) {
  return request('/api/shipment/updatePackage', {
    method: 'POST',
    data: params,
  });
}

// shipment/getList
export async function getList(params: any) {
  return request('/api/shipment/getList', {
    method: 'POST',
    data: params,
  });
}

//shipment/downloadTemplate
export async function downloadTemplate(params: any) {
  return request('/api/shipment/downloadTemplate', {
    method: 'POST',
    data: params,
  });
}

//shipment/saveInRealTime
export async function saveInRealTime(params: any) {
  return request('/api/shipment/saveInRealTime', {
    method: 'POST',
    data: params,
  });
}

// shipment/getTrackingdetail
export async function getTrackingdetail(params: { shipment_id: string }) {
  return request('/api/shipment/getTrackingdetail', {
    method: 'POST',
    data: params,
  });
}

//store/getInfo
export async function getInfo() {
  return request('/api/store/getInfo', {
    method: 'POST'
  });
}

// store/editAddress
export async function editAddress(params: any) {
  return request('/api/store/editAddress', {
    method: 'POST',
    data: params,
  });
}

// /timer/getListingByAmazon
export async function getListingByAmazon() {
  return request('/api/timer/getListingByAmazon', {
    method: 'POST',
  });
}

//shipment/estimateTransport
export async function estimateTransport(params: any) {
  return request('/api/shipment/estimateTransport', {
    method: 'POST',
    data: params,
  });
}

//shipment/confirmTransport
export async function confirmTransport(params: any) {
  return request('/api/shipment/confirmTransport', {
    method: 'POST',
    data: params,
  });
}

// shipment/updateFnSku
export async function updateFnSku(params: { sku: string }) {
  return request('/api/shipment/updateFnSku', {
    method: 'POST',
    data: params,
  });
}
// shipment/deleteShipment
export async function deleteShipment(params: { shipment_id: string }) {
  return request('/api/shipment/deleteShipment', {
    method: 'POST',
    data: params,
  });
}

//shipment/getLog
export async function getLog(params: { shipment_id: string }) {
  return request('/api/shipment/getLog', {
    method: 'POST',
    data: params,
  });
}

// shipment/getShipment
export async function getShipment(params: { shipment_id: string }) {
  return request('/api/shipment/getShipment', {
    method: 'POST',
    data: params,
  });
}

// shipment/getPrepInstructions
export async function getPrepInstructions(params: { sku: string }) {
  return request('/api/shipment/getPrepInstructions', {
    method: 'POST',
    data: params,
  });
}

// getItemEligibilityPreview
export async function getItemEligibilityPreview(params: { asin: string }) {
  return request('/api/shipment/getItemEligibilityPreview', {
    method: 'POST',
    data: {
      ...params,
      program: 'INBOUND',
    },
  });
}

export interface AddressItem {
  id: number;
  store_id: string;
  name: string;
  address_line1: string;
  address_line2: string;
  district_or_county: string;
  city: string;
  state_or_province_code: string;
  postal_code: string;
  country_code: string;
}

export type ListItem = {
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
  prepDetailsList?: { prepInstruction: string, prepOwner: string }[];
};