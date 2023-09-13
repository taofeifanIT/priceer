/*
 * @Author: taofeifanIT 3553447302@qq.com
 * @Date: 2022-08-05 17:23:24
 * @LastEditors: taofeifanIT 3553447302@qq.com
 * @LastEditTime: 2022-08-15 17:21:36
 * @FilePath: \priceer\src\services\reportView.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { request } from 'umi';



export type listingItem = {
    page: number;
    len: number;
}


export async function downloadFile(params: { year: number, week: number, reportNames?: string[] }) {
    return request('/api/dataReport/downloadFile', {
        method: 'post',
        responseType: 'blob',
        data: params
    });
}

export async function index() {
    return request('/api/dataReport/index', {
        method: 'get'
    });
}

export async function warehouseDownloadFile(params: { year: number, week: number, reportNames?: string[] }) {
    return request('/api/dataReport/warehouse_downloadFile', {
        method: 'post',
        responseType: 'blob',
        data: params
    });
}

export async function warehouseIndex() {
    return request('/api/dataReport/warehouse', {
        method: 'get'
    });
}

// dataReport/getInventoryAge
export async function getInventoryAge(params: { page: number, len: number, type?: string }) {
    return request('/api/dataReport/getInventoryAge', {
        method: 'post',
        data: params
    });
}

// dataReport/getFbaInventoryAge
export async function getFbaInventoryAge(params: { page: number, len: number, store_id?: number }) {
    return request('/api/dataReport/getFbaInventoryAge', {
        method: 'post',
        data: params
    });
}