import type { RequirementListItem } from '@/services/odika/requirementList';
import { Space, Image, Typography } from 'antd';
import { getImageUrl } from '@/utils/utils'
const { Text } = Typography;

const getInfoComponent = (record: RequirementListItem) => {
    let imgUrl: any = { url: 'http://api-rp.itmars.net/example/default.png', thunmb_url: 'http://api-rp.itmars.net/example/default.png' };
    if (record.mainPicture?.whiteBackgroundAndProps?.url) {
        imgUrl = {
            url: getImageUrl(record.mainPicture?.whiteBackgroundAndProps?.url[0]),
            thunmb_url: getImageUrl(record.mainPicture?.whiteBackgroundAndProps?.url[0])
        }
    } else if (record.mainPicture?.sizeAndNaterial?.url) {
        imgUrl = {
            url: getImageUrl(record.mainPicture?.sizeAndNaterial?.url[0]),
            thunmb_url: getImageUrl(record.mainPicture?.sizeAndNaterial?.url[0])
        }
    }
    return <>
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
    </>
}

export default getInfoComponent;