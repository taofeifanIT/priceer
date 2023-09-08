import { QuestionCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
export default (props: { title: string }) => {
    const { title } = props
    return (
        <Tooltip title={title}>
            <QuestionCircleOutlined style={{ marginLeft: '5px', cursor: 'pointer' }} />
        </Tooltip>
    )
}