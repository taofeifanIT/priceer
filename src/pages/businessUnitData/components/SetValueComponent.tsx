import { useEffect, useState, useRef } from 'react'
import { message, Spin, Typography, InputNumber } from 'antd'
import { EditTwoTone } from '@ant-design/icons'

const SetValueComponent = (props: { id: number, editKey: string, value: string | number, api: any, refresh: () => void, type?: 'text' | 'number', numberStep?: number, otherParams?: any, disabled?: boolean }) => {
    const { id, editKey, value, api, refresh, type = 'text', numberStep = 1, otherParams = {}, disabled = false } = props
    const [paramValue, setParamValue] = useState(value)
    const [spinning, setSpinning] = useState(false)
    const [numberIsEdit, setNumberIsEdit] = useState(false)
    const numberRef = useRef(null)
    const savgValue = (val: any) => {
        setSpinning(true)
        api({ id, [editKey]: val, ...otherParams }).then((res: any) => {
            if (res.code) {
                message.success(`${editKey} set successfully`)
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
    useEffect(() => {
        setParamValue(value)
    }, [value])
    return (<>
        <Spin spinning={spinning}>
            {(type === 'text' && !disabled) && <Typography.Text
                style={{ width: '100%' }}
                ellipsis={{ rows: 1, expandable: true, symbol: 'more', tooltip: paramValue }}
                editable={{
                    onChange(val) {
                        // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                        if (val === paramValue) {
                            return
                        }
                        savgValue(val)
                    }
                }} >
                {paramValue}
            </Typography.Text>}
            {(type === 'number' && !disabled) && (<>
                {numberIsEdit ? <InputNumber
                    ref={numberRef}
                    step={numberStep}
                    value={paramValue}
                    // 回车保存
                    onPressEnter={(e: any) => {
                        setNumberIsEdit(false)
                        // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                        if (e.target.value == value) {
                            return
                        }
                        savgValue(e.target.value)
                    }}
                    onBlur={(e) => {
                        setNumberIsEdit(false)
                        // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                        if (e.target.value == value) {
                            return
                        }
                        savgValue(e.target.value)
                    }}
                    onChange={(val: any) => {
                        setParamValue(val)
                    }}
                /> :
                    <>
                        {paramValue}
                        <EditTwoTone onClick={() => {
                            setNumberIsEdit(true)
                            setTimeout(() => {
                                numberRef.current?.focus()
                            }, 100)
                        }
                        } />
                    </>}
            </>)}
            {disabled && paramValue}
        </Spin>

    </>)
}

export default SetValueComponent