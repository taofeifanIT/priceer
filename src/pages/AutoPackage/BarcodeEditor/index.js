import './style.less'
import React, { useState } from 'react'

const BarcodeEditor = (props) => {
    const { barcodeHeight, barcodeDegreeOfThickness, setBarcodeHeight, setBarcodeDegreeOfThickness } = props
    const [barCodeStypeObj, setBarCodeStypeObj] = useState({
        height: barcodeHeight,
        width: barcodeDegreeOfThickness,
    });

    const handleInputWidth = (e) => {
        setBarCodeStypeObj({
            ...barCodeStypeObj,
            width: e.target.value
        })
        setBarcodeDegreeOfThickness(e.target.value)
    }
    const handleInputHeight = (e) => {
        setBarCodeStypeObj({
            ...barCodeStypeObj,
            height: e.target.value
        })
        setBarcodeHeight(e.target.value)
    }
    return <div className='barcodeEditor'>
        <div style={{ width: '100%' }}>
            条形码粗细：
            <input type='number' value={barCodeStypeObj.width} onChange={handleInputWidth} />
            <br />
            <button className='barcodeEditorBtn' onClick={() => {
                setBarCodeStypeObj({
                    ...barCodeStypeObj,
                    width: Number(barCodeStypeObj.width) + 1
                })
                setBarcodeDegreeOfThickness(Number(barCodeStypeObj.width) + 1)
            }}>
                ➕
            </button>
            <button className='barcodeEditorBtn' onClick={() => {
                setBarCodeStypeObj({
                    ...barCodeStypeObj,
                    width: Number(barCodeStypeObj.width) - 1
                })
                setBarcodeDegreeOfThickness(Number(barCodeStypeObj.width) - 1)
            }}>
                ➖
            </button>
        </div>
        <div style={{
            // // 子元素超出父元素宽度时，不换行
            // whiteSpace: 'nowrap',
            width: '100%'
        }}>
            条形码高度：
            {/* <input value={barcodeDegreeOfThickness} onChange={e => setBarcodeDegreeOfThickness(e.target.value)} /> */}
            <input type='number' value={barCodeStypeObj.height} onChange={handleInputHeight} />
            <br />
            <button className='barcodeEditorBtn' onClick={() => {
                setBarCodeStypeObj({
                    ...barCodeStypeObj,
                    height: Number(barCodeStypeObj.height) + 1
                })
                setBarcodeHeight(Number(barCodeStypeObj.height) + 1)
            }}>
                ➕
            </button>
            <button className='barcodeEditorBtn' onClick={() => {
                setBarCodeStypeObj({
                    ...barCodeStypeObj,
                    height: Number(barCodeStypeObj.height) - 1
                })
                setBarcodeHeight(Number(barCodeStypeObj.height) - 1)
            }}>
                ➖
            </button>
        </div>
    </div>
}

export default BarcodeEditor