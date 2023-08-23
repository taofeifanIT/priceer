import type { RequirementListItem } from '@/services/odika/requirementList';
import { Space, Image, Typography } from 'antd';
import { getImageUrl } from '@/utils/utils'
const { Text } = Typography;



const getInfoComponent = (record: RequirementListItem) => {
    let imgUrl: any = { url: `${API_URL}/example/default.png`, thunmb_url: `${API_URL}/example/default.png`, isDefault: true };
    const getFirstImage = () => {
        let firstUrl: any = '';
        if (record.mainPicture?.whiteBackgroundAndProps.url && record.mainPicture?.whiteBackgroundAndProps.url.length) {
            firstUrl = record.mainPicture?.whiteBackgroundAndProps.url[0];
            return { url: getImageUrl(firstUrl), thunmb_url: getImageUrl(firstUrl) }
        }
        if (record.mainPictures && record.mainPictures.length && record.mainPictures[0].thunmb_url && record.mainPictures[0].thunmb_url.length) {
            firstUrl = record.mainPictures[0].thunmb_url[0];
            return { url: getImageUrl(firstUrl), thunmb_url: getImageUrl(firstUrl) }
        }
        if (record.mainPicture?.sizeAndNaterial.url && record.mainPicture?.sizeAndNaterial.url.length) {
            firstUrl = record.mainPicture?.sizeAndNaterial.url[0];
            return { url: getImageUrl(firstUrl), thunmb_url: getImageUrl(firstUrl) }
        }
        return imgUrl;
    }

    imgUrl = getFirstImage();
    return <div key={record.id}>
        <Space>
            <div style={{ display: 'inline-block', 'width': 50 }}>
                <Image
                    width={50}
                    height={50}
                    src={imgUrl.thunmb_url}
                    preview={{
                        src: imgUrl.url,
                    }} />
            </div>
            <div style={{ display: 'inline-block', width: 300 }}>
                <Text>{record.sku}</Text>
                <Text style={{ maxWidth: '300px', display: 'block' }} ellipsis={{ tooltip: record.memo }} type="secondary">{record.memo}</Text>
            </div>
        </Space>
    </div>
}

export default getInfoComponent;