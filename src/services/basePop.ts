import { request } from 'umi';

export type storeItem = {
    label: string;
    value: number;
}

export async function stores() {
    return new Promise<any>((resolve) => {
        request('/api/store/index', {
            method: 'POST'
        }).then(res => {
            if (res.code) {
                // @ts-ignore
                let data = res.data.map(item => {
                    return {
                        label: item.name,
                        value: item.id
                    }
                })
                resolve(data)
            } else {
                resolve([])
            }
        });
    })
}

export async function getConfig() {
    return request('/api/store/getConfig', {
        method: 'POST'
    });
}