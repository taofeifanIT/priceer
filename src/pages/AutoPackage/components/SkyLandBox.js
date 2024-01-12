import React, { useState } from 'react'
import Barcode from '../Barcode';
import './style.css'
import StyleTrimmer from '../StyleTrimmer';
import { Address as address } from './basicInfo'
import BarcodeEditor from '../BarcodeEditor';

const cmToPx = (val) => {
  const ONECM = 28.1541143234;
  return val * ONECM;
};

const getFontSize = () => {
  return '3rem'
}

const barcodeAroundFontSize = (boxheight) => {
  return (boxheight * 0.07) + 'cm'
}

const Package = (props) => {
  const { boxInfo } = props

  const detail = {
    sku: boxInfo.sku,
    length: boxInfo.length,
    width: boxInfo.width,
    height: boxInfo.height,
    logistics: boxInfo.logistics,
    productName: boxInfo.productName,
    nw: boxInfo.nw,
    nwLbs: boxInfo.nwLbs,
    gw: boxInfo.gw,
    gwLbs: boxInfo.gwLbs,
    meas: boxInfo.meas,
    productionDate: boxInfo.productionDate,
    src: boxInfo.src,
    isExplosion: boxInfo.isExplosion,
    manufacturer: boxInfo.manufacturer
  }

  const {
    sku,
    length,
    width,
    height,
    logistics,
    productName,
    nw,
    gw,
    meas,
    productionDate,
    src,
    isExplosion,
    manufacturer
  } = detail
  const FrontSize = getFontSize()
  const [currentEditId, setCurrentEditId] = React.useState(null)
  const [style, setStyle] = React.useState({});
  const [barcodeHeight, setBarcodeHeight] = useState(cmToPx(height / 6));
  const [barcodeDegreeOfThickness, setBarcodeDegreeOfThickness] = useState((cmToPx(height / 12) / 17));

  const myBarcode = <Barcode
    value={sku}
    displayValue={false}
    height={barcodeHeight}
    width={barcodeDegreeOfThickness}
  />

  const handleKeyDown = (domId) => {
    // 添加选中样式
    const dom = document.getElementById(domId)
    setCurrentEditId(domId)
    // dom增加一个叫做box-content的类名
    // dom.style.border = '1px solid #000'
    dom.classList.add('clickDiv')
    // 保存当前的样式
    const computedStyles = window.getComputedStyle(dom);
    const stylesObject = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      stylesObject[propertyName] = computedStyles.getPropertyValue(propertyName);
    }
    setStyle(stylesObject)
    // 移除其他box-plank选中样式
    const boxPlanks = document.getElementsByClassName('box-content')
    for (let i = 0; i < boxPlanks.length; i++) {
      if (boxPlanks[i].id !== domId) {
        boxPlanks[i].classList.remove('clickDiv')
      }
    }
  }

  // 监听鼠标事件
  document.onmousedown = (e) => {
    // 获取当前点击的dom的class
    const className = e.target.className
    // 如果点击的不是box-content
    const whiteList = ['box-content', 'style-editor-ul', 'style-editor-li', 'style-editor-lable', 'style-editor-input', 'style-editor-h2', 'style-editor-div', 'style-editor-container']
    if (!whiteList.includes(className)) {
      // 移除所有box-content的选中样式
      const boxPlanks = document.getElementsByClassName('box-content')
      for (let i = 0; i < boxPlanks.length; i++) {
        boxPlanks[i].classList.remove('clickDiv')
      }
      setCurrentEditId(null)
    }
  }
  const getOneRowTowlineContent = () => {
    return <>
      <div
        id='one-two-one'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafont',
          left: `${length * 0.04}cm`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClick={() => handleKeyDown('one-two-one')}
      >
        <div
          style={{
            transform: 'rotate(180deg)'
          }}>
          <span>{logistics.line1}</span>
          <div>
            {myBarcode}
          </div>
          <span>{sku}</span><br />
          <span>
            {
              logistics.line2
            }
          </span>
        </div>
      </div>
      <div
        id='one-two-two'
        className='box-content'
        style={{
          position: 'absolute',
          top: '50%',
          fontWeight: 'bold',
          transform: 'translateY(-50%)',
          right: `${length * 0.04}cm`,
        }}
        onClick={() => handleKeyDown('one-two-two')}
      >
        <img
          alt=''
          src={`/package/explosion/${isExplosion}.png`}
          style={{
            height: `${height * 0.5}cm`,
            transform: 'rotate(180deg)'
          }}
        />
      </div>
    </>
  }
  const getTowRowOneLineContent = () => {
    return <>
      <div
        id='two-one-one'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'left',
          position: 'absolute',
          fontFamily: 'odikafont',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%) rotate(90deg)',
        }}
        onClick={() => handleKeyDown('two-one-one')}
      >
        <span>{logistics.line1}</span>
        <div>
          {myBarcode}
        </div>
        <span>{sku}</span><br />
        <span>{logistics.line2}</span>
      </div>
    </>
  }
  const getTowRowThreeLineContent = () => {
    return <>
      <div
        id='two-three-one'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafont',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%) rotate(-90deg)',
        }}
        onClick={() => handleKeyDown('two-three-one')}
      >
        <span>{logistics.line1}</span><br />
        <span>{sku}</span>
        {myBarcode}
        <span>{logistics.line2}</span>
      </div>
    </>
  }
  const getTowRowTowLineContent = () => {
    return <>
      <img
        id="two-two-one"
        className='box-content'
        alt=''
        src='/package/odika-logo.png'
        style={{
          height: `${(width / 2) * 0.28}cm`,
          position: 'absolute',
          top: `${width * 0.12}cm`,
          left: `${length * 0.04}cm`,
        }}
        onClick={() => handleKeyDown('two-two-one')}
      />
      <div
        id="two-two-two"
        className='box-content'
        style={{
          fontSize: FrontSize,
          position: 'absolute',
          fontFamily: 'odikafontBold',
          left: `${length * 0.04}cm`,
          bottom: `${width * 0.12}cm`,
        }}
        onClick={() => handleKeyDown('two-two-two')}
      >
        <span>QTY:1pc</span><br />
        <span>N.W.:{nw}</span><br />
        <span>G.W.:{gw}</span><br />
        <span>MEAS:{meas}</span><br />
        <span>PRODUCTION DATE: {productionDate}</span><br />
      </div>
      <img
        id="two-two-three"
        className='box-content'
        alt=''
        src={src}
        style={{
          maxWidth: `50%`,
          height: `${width * 0.65}cm`,
          position: 'absolute',
          bottom: `${width * 0.12}cm`,
          right: `${length * 0.04}cm`,
        }}
        onClick={() => handleKeyDown('two-two-three')}
      />
    </>
  }
  const getThreeRowTowLineContent = () => {
    return <>
      <img
        id='three-two-one'
        className='box-content'
        alt=''
        src={`/package/explosion/${isExplosion}.png`}
        style={{
          height: `${height * 0.5}cm`,
          position: 'absolute',
          top: '50%',
          fontWeight: 'bold',
          transform: 'translateY(-50%)',
          left: `${length * 0.04}cm`,
        }}
        onClick={() => handleKeyDown('three-two-one')}
      />
      <div
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          top: '50%',
          fontFamily: 'odikafont',
          right: `${length * 0.04}cm`,
          transform: 'translateY(-50%)'
        }}>
        <span>SJW YWL</span><br />
        <div>
          {myBarcode}
        </div>
        <span>{sku}</span><br />
        <span>SHW WL-051</span>
      </div>
    </>
  }
  const getFourRowTowLineContent = () => {
    return <>
      <div
        id='four-two-one'
        className='box-content'
        style={{
          fontSize: FrontSize,
          position: 'absolute',
          fontFamily: 'odikafontBold',
          left: `${length * 0.04}cm`,
          bottom: `${width * 0.12}cm`,
        }}
        onClick={() => handleKeyDown('four-two-one')}
      >
        <span>{productName}</span><br />
        <span>{sku}</span><br />
        <span>{manufacturer}</span><br />
      </div>
      <img
        id='four-two-two'
        className='box-content'
        alt=''
        src='/package/odika-logo.png'
        style={{
          height: `${(width / 2) * 0.3}cm`,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => handleKeyDown('four-two-two')}
      />
      <div
        id='four-two-three'
        className='box-content'
        style={{
          fontSize: FrontSize,
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafontBold',
          right: `${length * 0.04}cm`,
          bottom: `${width * 0.12}cm`,
        }}
        onClick={() => handleKeyDown('four-two-three')}
      >
        <span>Distributed By:</span><br />
        <span>{address.line1}</span><br />
        <span>{address.line2}</span><br />
        <span>{address.line3}</span><br />
        <span>{address.line4}</span><br />
      </div>
    </>
  }
  const content = [
    // 第一行
    [null, getOneRowTowlineContent(), null],
    // 第二行
    [getTowRowOneLineContent(), getTowRowTowLineContent(), getTowRowThreeLineContent()],
    // 第三行
    [null, getThreeRowTowLineContent(), null],
  ]

  const contentSecond = [
    // 第一行
    [null, null, null],
    // 第二行
    [null, getFourRowTowLineContent(), null],
    // 第三行
    [null, null, null],
  ]

  const getContent = (row, col) => {
    return content[row - 1][col - 1]
  }

  const getSecondContent = (row, col) => {
    return contentSecond[row - 1][col - 1]
  }

  return (<>
    <BarcodeEditor
      key='barcodeEditor'
      barcodeHeight={barcodeHeight}
      barcodeDegreeOfThickness={barcodeDegreeOfThickness}
      setBarcodeHeight={setBarcodeHeight}
      setBarcodeDegreeOfThickness={setBarcodeDegreeOfThickness}
    />
    <StyleTrimmer domId={currentEditId} styleObj={style} />
    <div
      id='box'
      style={{
        width: `${(Number(height) * 2 + Number(length))}cm`,
      }}>
      <div className='box'>
        {/* 第一行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(1, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getContent(1, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(1, 3)}
          </div>
        </div>
        {/* 第二行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${width}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            position: 'relative',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(2, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${width}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getContent(2, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${width}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            position: 'relative',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(2, 3)}
          </div>
        </div>
        {/* 第三行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(3, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getContent(3, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getContent(3, 3)}
          </div>
        </div>
      </div>
      <div className='box' id='box2'
        style={{
          marginTop: '100px'
        }}
      >
        {/* 第一行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(1, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getSecondContent(1, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(1, 3)}
          </div>
        </div>
        {/* 第二行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${width}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(2, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${width}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getSecondContent(2, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${width}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(2, 3)}
          </div>
        </div>
        {/* 第三行 */}
        <div>
          {/* 1 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(3, 1)}
          </div>
          {/* 2 */}
          <div
            className='box-plank'
            style={{
              width: `${length}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              position: 'relative',
              boxSizing: 'border-box',
              verticalAlign: 'top',
            }} >
            {getSecondContent(3, 2)}
          </div>
          {/* 3 */}
          <div className='box-plank' style={{
            width: `${height}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
          }}>
            {getSecondContent(3, 3)}
          </div>
        </div>
      </div>
    </div>
  </>)
}

export default Package

