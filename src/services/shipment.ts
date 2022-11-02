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
  });
}

// shipment/updatePackageByFile upload file
export async function updatePackageByFile(params: { shipment_id: string; file: any }) {
  return request('/api/shipment/updatePackageByFile', {
    method: 'POST',
    data: params,
    requestType: 'form',
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
