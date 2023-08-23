import { useState } from 'react'
import { message, Space, Typography, Input, Modal } from 'antd'
import { EditTwoTone } from '@ant-design/icons'
const { Paragraph } = Typography


export default (props: { id: number, editKey: string, value: string | number, api: any, refresh: () => void, otherParams?: any }) => {
    const { id, editKey, value, api, refresh, otherParams = {} } = props
    const [paramValue, setParamValue] = useState(value)
    const [visible, setVisible] = useState(false)
    const [spinning, setSpinning] = useState(false)
    const handleOk = () => {
        setSpinning(true)
        console.log({ id, [editKey]: paramValue, ...otherParams })
        api({ id, [editKey]: paramValue, ...otherParams }).then((res: any) => {
            if (res.code) {
                message.success(`${editKey} set successfully`)
                setVisible(false)
                refresh()
            } else {
                throw res.msg
            }
        }).catch((err: any) => {
            message.error('Claim number set failed ' + err)
        }).finally(() => {
            setSpinning(false)
        })
    }
    const handleCancel = () => {
        setVisible(false)
    }
    const show = () => {
        setVisible(true)
    }
    return (<>
        <Modal title="Edit Comments" open={visible} confirmLoading={spinning} onOk={handleOk} onCancel={handleCancel}>
            <Input.TextArea rows={4} aria-autocomplete='new-password' value={paramValue} onChange={(e) => {
                setParamValue(e.target.value)
            }} />
        </Modal>
        <Space align='center'>
            <Paragraph ellipsis={{ tooltip: value }} style={{ maxWidth: '110px', display: 'inline-block', marginBottom: -5 }}>{value}</Paragraph >
            <EditTwoTone onClick={show} />
        </Space>
    </>)
}