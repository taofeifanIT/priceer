import { request } from 'umi';

export interface saveDesignParams {
    id?: number;
    username?: string;
    createTime?: string;
    sku: string;
    competitor: string;
    mainPictures: {
        url: string[];
        memo: string;
    }[];
    mainPicture: {
        whiteBackgroundAndProps: {
            url: string[];
            memo: string;
            thumbnail?: string[];
        },
        sizeAndNaterial: {
            url: string[];
            memo: string;
            thumbnail?: string[];
        }
    },
    auxiliaryPicture: {
        sellingPoint: any[];
        url: string[];
        memo: string;
        thumbnail?: string[];
    },
    auxiliaryPictures: {
        sellingPoint: string[];
        url: string[];
        memo: string;
        thumbnail?: string[];
    }[],
    auxiliaryPictureScene: {
        scene: string;
        url: string[];
        memo: string;
        thumbnail?: string[];
    }[],
    aPlus: {
        type: string;
        aplusScene: {
            scene: string;
            url: string[];
            memo: string;
            pictureRequirement: string;
            thumbnail?: string[];
        }[]
    },
    detailPicture: {
        detailRequirementPoint: string;
        url: string[];
        memo: string;
        thumbnail?: string[];
    }[],
    reason: string;
    reason_require: string;
    reason_canto: string;
}
export interface submitDesignParams {
    sku: string;
    competitor: string[];
    mainPictures: {
        url: string[];
        memo: string;
        thumbnail: string[];
    }[];
    mainPicture: {
        whiteBackgroundAndProps: {
            url: any;
            memo: string;
            thumbnail: string;
        },
        sizeAndNaterial: {
            url: any;
            memo: string;
            thumbnail: string;
        }
    },
    auxiliaryPicture: {
        sellingPoint: string[];
        url: any;
        thumbnail: string;
        memo: string;
    },
    auxiliaryPictures: {
        sellingPoint: string[];
        url: any;
        thumbnail: string;
        memo: string;
    }[],
    auxiliaryPictureScene: {
        scene: string;
        url: any;
        thumbnail: string;
        memo: string;
    }[],
    aPlus: {
        type: string;
        aplusScene: {
            scene: string;
            url: any;
            thumbnail: string;
            memo: string;
            pictureRequirement: string;
        }[]
    },
    detailPicture: {
        detailRequirementPoint: string;
        url: any;
        thumbnail: string;
        memo: string;
    }[]
}

export type RequirementListItem = {
    id: number;
    sku: string;
    status: number;
    priority: number;
    reason: string;
    reason_require: string;
    creator: string;
    memo: string;
    creator_id: number;
    state: number;
    state_reason: string;
    mainPictures: {
        url: string[];
        memo: string;
        thunmb_url: string[];
    }[];
    mainPicture: {
        whiteBackgroundAndProps: {
            url: string;
            memo: string;
        },
        sizeAndNaterial: {
            url: string;
            thunmb_url: string;
            memo: string;
        }
    };
    createTime: string;
    expectTime: string;
    canto_url: string;
    close_sort: number;
    reason_canto: string;
    is_read: 0 | 1 | 2; // 0 默认 1 已读 2 未读
}

interface DesignListParams {
    status: number | undefined;
    keyword: string | undefined;
    len: number;
    page: number;
}

// design/getSkuList
export async function getSkuList() {
    return request('/api/design/getSkuList', {
        method: 'POST',
    });
}

// design/save
export async function saveDesign(params: saveDesignParams) {
    return request('/api/design/save', {
        method: 'POST',
        data: params
    });
}

// design/edit
export async function editDesign(params: saveDesignParams) {
    return request('/api/design/edit', {
        method: 'POST',
        data: params
    });
}

// design/getList
export async function getDesignList(params: DesignListParams) {
    return request('/api/design/getList', {
        method: 'POST',
        data: params
    });
}

// design/getDetail
export async function getDesignDetail(params: { id: number }) {
    return request('/api/design/getDetail', {
        method: 'POST',
        data: params
    });
}
// design/getListForSort
export async function getListForSort(params: { keyword?: string }) {
    return request('/api/design/getListForSort', {
        method: 'POST',
        data: params
    });
}

// design/editSort
export async function editSort(params: { activeItem: { id: number, priority: number }, oldItem: { id: number, priority: number } }) {
    return request('/api/design/editSort', {
        method: 'POST',
        data: params
    });
}

// design/editSortNew
export async function editSortNew(params: { id: number, priority: number }[]) {
    return request('/api/design/editSortNew', {
        method: 'POST',
        data: params
    });
}

// design/submit
export async function submitDesign(params: { id: number }) {
    return request('/api/design/submit', {
        method: 'POST',
        data: params
    });
}

// design/getListForCheck
export async function getListForCheck(params: { keyword?: string }) {
    return request('/api/design/getListForCheck', {
        method: 'POST',
        data: params
    });
}

// design/check
export async function checkDesign(params: { id: number, status: number, reason: string }) {
    return request('/api/design/check', {
        method: 'POST',
        data: params
    });
}

// design/getListForPlan
export async function getListForPlan(params: { keyword?: string }) {
    return request('/api/design/getListForPlan', {
        method: 'POST',
        data: params
    });
}

// design/editPlan
export async function editPlan(params: { id: number, status: number }) {
    return request('/api/design/editPlan', {
        method: 'POST',
        data: params
    });
}

// design/editExpectTime
export async function editExpectTime(params: { id: number, expect_time: string }) {
    return request('/api/design/editExpectTime', {
        method: 'POST',
        data: params
    });
}

// design/editSortV3
export async function editSortV3(params: { id: number, no: number, is_lock: number }) {
    return request('/api/design/editSortV3', {
        method: 'POST',
        data: params
    });
}

// /design/uploadTemplate
export async function uploadTemplate(file: any, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return request('/api/design/uploadTemplate', {
        method: 'POST',
        data: formData,
        formData,
        requestType: 'form'
    });
}

// design/checkImage
export async function checkImage(params: { id: number, status: 1 | 0, type: 1 | 2, reason?: string }) {
    return request('/api/design/checkImage', {
        method: 'POST',
        data: params
    });
}


// design/read
export async function read(params: { id: number }) {
    return request('/api/design/read', {
        method: 'POST',
        data: params
    });
}