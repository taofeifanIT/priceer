import { useEffect, useState, useRef } from 'react'
import { message, Spin, Typography, InputNumber, Select } from 'antd'
import { EditTwoTone } from '@ant-design/icons'
const { Option } = Select

const SetValueComponent = (props: {
    id: number,
    editKey: string,
    value: string | number,
    api: any,
    refresh: () => void,
    type?: 'text' | 'number' | 'select',
    numberStep?: number,
    otherParams?: any,
    disabled?: boolean,
    prefix?: string
    options?: { label: string, value: string | number }[]
}) => {
    const {
        id,
        editKey,
        value,
        api,
        refresh,
        type = 'text',
        numberStep = 1,
        otherParams = {},
        disabled = false,
        options = []
    } = props
    const [paramValue, setParamValue] = useState(value)
    const [spinning, setSpinning] = useState(false)
    const [numberIsEdit, setNumberIsEdit] = useState(false)
    const numberRef = useRef(null)
    const savgValue = (val: any) => {
        setSpinning(true)
        api({ id, [editKey]: type === 'number' ? Number(val) : val, ...otherParams }).then((res: any) => {
            if (res.code) {
                message.success(`${editKey} set successfully`)
                refresh()
            } else {
                // 报错恢复原值
                setParamValue(value)
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
                {(props.prefix && !numberIsEdit) && <span>{props.prefix}</span>}
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
            {/* select */}
            {(type === 'select' && !disabled) && (<>
                {(props.prefix && !numberIsEdit) && <span>{props.prefix}</span>}
                {numberIsEdit ?
                    <Select
                        style={{ width: 120 }}
                        autoFocus={true}
                        onBlur={() => {
                            setNumberIsEdit(false)
                        }}
                        size='small'
                        value={paramValue}
                        onChange={(val: any) => {
                            setParamValue(val)
                            setNumberIsEdit(false)
                            // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                            if (val == value) {
                                return
                            }
                            savgValue(val)
                        }}
                    >
                        {options.map((item) => {
                            return <Option key={item.value} value={item.value}>{item.label}</Option>
                        })}
                    </Select>
                    :
                    <>
                        {options.find((item) => item.value == paramValue)?.label}
                        <EditTwoTone onClick={() => {
                            setNumberIsEdit(true)
                        }
                        } />
                    </>}
            </>)}
        </Spin>

    </>)
}

export default SetValueComponent