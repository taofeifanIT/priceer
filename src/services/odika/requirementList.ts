import { request } from 'umi';

interface saveDesignParams {
    sku: string;
    mainPicture: {
        whiteBackgroundAndProps: {
            url: any;
            memo: string;
        },
        sizeAndNaterial: {
            url: any;
            memo: string;
        }
    },
    auxiliaryPicture: {
        sellingPoint: string[];
        url: any;
        memo: string;
    },
    auxiliaryPictureScene: {
        scene: string;
        url: any;
        memo: string;
    }[],
    aPlus: {
        type: string;
        aplusScene: {
            scene: string;
            url: any;
            memo: string;
            pictureRequirement: string;
        }[]
    },
    detailPicture: {
        detailRequirementPoint: string;
        url: any;
        memo: string;
    }[]
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