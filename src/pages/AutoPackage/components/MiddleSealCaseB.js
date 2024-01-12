import React, { useState } from 'react'
import Barcode from '../Barcode';
import './style.css'
import StyleTrimmer from '../StyleTrimmer';
import { Address as address } from './basicInfo'
import BarcodeEditor from '../BarcodeEditor';

const cmToPx = (val) => {
  const ONECM = 28.1641143234;
  return val * ONECM;
};

const getFontSize = () => {
  return '2.5rem'
}

const barcodeAroundFontSize = (boxheight) => {
  return (boxheight * 0.09) + 'cm'
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

  const [currentEditId, setCurrentEditId] = React.useState(null)
  const [style, setStyle] = React.useState({});
  const [barcodeHeight, setBarcodeHeight] = useState(cmToPx(height / 4));
  const [barcodeDegreeOfThickness, setBarcodeDegreeOfThickness] = useState((cmToPx(height / 12) / 15));

  const handleKeyDown = (e, domId) => {
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

  const myBarcode = <Barcode
    value={sku}
    renderer='img'
    displayValue={false}
    height={barcodeHeight}
    width={barcodeDegreeOfThickness}
  />

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



  // 1 2
  const getRowOneColTwoContent = () => {
    return <>
      <div
        id='one-two-one'
        className='box-content'
        style={{
          fontSize: getFontSize(),
          position: 'absolute',
          fontFamily: 'odikafont',
          bottom: `${(width / 2) * 0.08}cm`,
          left: `${length * 0.04}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'one-two-one'))}
      >
        <span>{productName}</span><br />
        <span>{sku}</span><br />
        <span>{manufacturer}</span>
      </div>
      <div
        id='one-two-two'
        className='box-content'
        style={{
          fontSize: getFontSize(),
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafont',
          right: `${length * 0.04}cm`,
          bottom: `${(width / 2) * 0.08}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'one-two-two'))}
      >
        <span>Distributed By:</span><br />
        <span>{address.line1}</span><br />
        <span>{address.line2}</span><br />
        <span>{address.line3}</span><br />
        <span>{address.line4}</span><br />
      </div>
    </>
  }

  // 2 2
  const getRowTwoColTwoContent = () => {
    return <>
      <img
        id='two-two-one'
        className='box-content'
        alt=''
        src='/package/caution.png'
        style={{
          height: `${height * 0.4}cm`,
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: `${length * 0.04}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'two-two-one'))}
      />
      <div
        id='two-two-two'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'left',
          position: 'absolute',
          fontFamily: 'odikafont',
          right: `${length * 0.04}cm`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClick={(e => handleKeyDown(e, 'two-two-two'))}
      >
        <div
          style={{
            transform: 'rotate(180deg)'
          }}>
          <span>
            {
              logistics.line1
            }
          </span>
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
    </>
  }

  // 3 1
  const getRowThreeColOneContent = () => {
    return <>
      <div
        id='three-one-one'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'left',
          position: 'absolute',
          fontFamily: 'odikafont',
          top: '50%',
          left: '50%',
          whiteSpace: 'nowrap',
          transform: 'translate(-50%,-50%) rotate(90deg)',
        }}
        onClick={(e => handleKeyDown(e, 'three-one-one'))}>
        <span>{logistics.line1}</span>
        <div>
          {myBarcode}
        </div>
        <span
        >{sku}</span><br />
        <span>
          {
            logistics.line2
          }
        </span>
      </div>
    </>
  }

  // 3 2
  const getRowThreeColTwoContent = () => {
    return <>
      <img
        alt=''
        src='/package/odika-logo.png'
        id='three-two-one'
        className='box-content'
        style={{
          width: `${(length / 2) * 0.72}cm`,
          position: 'absolute',
          top: `${(width) * 0.12}cm`,
          left: `${(length) * 0.04}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'three-two-one'))}
      />
      <div
        id='three-two-two'
        className='box-content'
        style={{
          fontSize: getFontSize(),
          position: 'absolute',
          fontFamily: 'odikafontBold',
          left: `${(length) * 0.04}cm`,
          bottom: `${(width) * 0.12}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'three-two-two'))}
      >
        <span>QTY:1pc</span><br />
        <span>N.W.:{nw}</span><br />
        <span>G.W.:{gw}</span><br />
        <span>MEAS:{meas}</span><br />
        <span>PRODUCTION DATE: {productionDate}</span><br />
      </div>
      <img
        alt=''
        src={src}
        id='three-two-three'
        className='box-content'
        style={{
          height: `${(length / 2) * 0.52}cm`,
          position: 'absolute',
          bottom: `${width * 0.12}cm`,
          right: `${length * 0.04}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'three-two-three'))}
      />
    </>
  }

  // 3 3
  const getRowThreeColThreeContent = () => {
    return <>
      <div
        id='three-three-one'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafont',
          top: '50%',
          left: '50%',
          whiteSpace: 'nowrap',
          transform: 'translate(-50%,-50%) rotate(-90deg)',
        }}
        onClick={(e => handleKeyDown(e, 'three-three-one'))}
      >
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
    </>
  }

  // 4 2
  const getRowFourColTwoContent = () => {
    return <>
      <img
        id='four-two-one'
        className='box-content'
        alt=''
        src={`/package/explosion/${isExplosion}.png`}
        style={{
          position: 'absolute',
          top: '50%',
          fontWeight: 'bold',
          transform: 'translateY(-50%)',
          left: `${length * 0.04}cm`,
          height: `${height * 0.4}cm`,
        }}
        onClick={(e => handleKeyDown(e, 'four-two-one'))}
      />
      <div
        id='four-two-two'
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          top: '50%',
          fontFamily: 'odikafont',
          right: `${length * 0.04}cm`,
          transform: 'translateY(-50%)'
        }}
        onClick={(e => handleKeyDown(e, 'four-two-two'))}
      >
        <span>
          {
            logistics.line1
          }
        </span><br />
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
    </>
  }

  // 5 2
  const getRowFiveColTwoContent = () => {
    return <img
      alt=''
      src='/package/odika-logo.png'
      id='five-two-one'
      className='box-content'
      style={{
        height: `${(width / 2) * 0.3}cm`,
        // maxWidth: `${cmToPx(length/2) * 1.5}px`,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      onClick={(e => handleKeyDown(e, 'five-two-one'))}
    />
  }

  const content = [
    [null, getRowOneColTwoContent(), null],
    [null, getRowTwoColTwoContent(), null],
    [getRowThreeColOneContent(), getRowThreeColTwoContent(), getRowThreeColThreeContent()],
    [null, getRowFourColTwoContent(), null],
    [null, getRowFiveColTwoContent(), null]
  ]

  return (<>
    <BarcodeEditor
      key='barcodeEditor'
      barcodeHeight={barcodeHeight}
      barcodeDegreeOfThickness={barcodeDegreeOfThickness}
      setBarcodeHeight={setBarcodeHeight}
      setBarcodeDegreeOfThickness={setBarcodeDegreeOfThickness}
    />
    <StyleTrimmer domId={currentEditId} styleObj={style} />
    <div className='box' id='box'
      style={{
        width: `${(height * 2 + Number(length))}cm`,
        boxSizing: 'border-box',
      }}
    >
      {/* 第一行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
        {/* 2 */}
        <div
          className='box-plank'
          style={{
            width: `${length}cm`,
            height: `${width / 2}cm`,
            border: '1px solid #000',
            verticalAlign: 'top',
            display: 'inline-block',
            boxSizing: 'border-box',
            position: 'relative',
          }} >
          {content[0][1]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
      </div>
      {/* 第二行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          boxSizing: 'border-box',
          display: 'inline-block',
          verticalAlign: 'top',
        }} />
        {/* 2 */}
        <div className='box-plank'
          style={{
            width: `${length}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            position: 'relative',
            verticalAlign: 'top',
          }} >
          {content[1][1]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top'
        }} />
      </div>
      {/* 第三行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${width}cm`,
          border: '1px solid #000',
          boxSizing: 'border-box',
          display: 'inline-block',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[2][0]}
        </div>
        {/* 2 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${width}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[2][1]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${width}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[2][2]}
        </div>
      </div>
      {/* 第四行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
        {/* 2 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[3][1]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
      </div>
      {/* 第五行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
        {/* 2 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[4][1]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
      </div>
    </div>
  </>)
}

export default Package

