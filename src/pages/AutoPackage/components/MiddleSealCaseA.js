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
  return (boxheight * 0.05) + 'cm'
}

const Package = (props) => {
  const FrontSize = getFontSize()

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
  const [barcodeHeight, setBarcodeHeight] = useState(cmToPx(height / 7));
  const [barcodeDegreeOfThickness, setBarcodeDegreeOfThickness] = useState((cmToPx(height / 12) / 14));

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

  const getRowOneColOne = () => {
    return <img
      alt=''
      src='/package/odika-logo.png'
      style={{
        height: `${(width / 2) * 0.25}cm`,
        transform: 'rotate(180deg)',
        position: 'absolute',
        bottom: `${((width / 2) * 0.2)}cm`,
        left: `${((length) * 0.65) * 0.08}cm`,
      }}
    />
  }

  const getRowOneColThree = () => {
    return <>
      <div
        className='box1-specification'
        style={{
          position: 'absolute',
          fontSize: FrontSize,
          left: `${(width / 2) * 0.1}cm`,
          bottom: `${(width / 2) * 0.1}cm`,
        }}>
        <span>QTY: 1pc</span><br />
        <span>N.W.:{nw}</span><br />
        <span>G.W.:{gw}</span><br />
        <span>MEAS:{meas}</span><br />
        <span>PRODUCTION DATE: {productionDate}</span><br />
      </div>
      <img alt='' src={src} style={{
        maxWidth: `50%`,
        height: `${(width / 2) * 0.7}cm`,
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginRight: `${(width / 2) * 0.1}cm`,
        marginBottom: `${(width / 2) * 0.1}cm`,
      }} />
    </>
  }

  const getRowTwoColOne = () => {
    return <>
      <div
        style={{
          fontSize: barcodeAroundFontSize(height),
          position: 'absolute',
          top: '50%',
          left: `${(width * 0.06)}cm`,
          transform: 'translateY(-50%)'
        }}
      >
        <span>{productName}</span><br />
        <span>{sku}</span><br />
        <span>{manufacturer}</span><br /><br />
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
      <div
        style={{
          fontSize: FrontSize,
          textAlign: 'right',
          position: 'absolute',
          top: '50%',
          right: `${(width * 0.06)}cm`,
          transform: 'translateY(-50%)',

        }}
      >
        <span>Distributed By:</span><br />
        <span>{address.line1}</span><br />
        <span>{address.line2}</span><br />
        <span>{address.line3}</span><br />
        <span>{address.line4}</span><br />
      </div>
    </>
  }

  const getRowTwoColTwo = () => {
    return <>
      <div
        id="one-tow-one"
        className='box-content'
        style={{
          position: 'absolute',
          fontWeight: 'bold',
          left: `${length * 0.04}cm`,
          top: '50%',
          transform: 'translateY(-50%) rotate(180deg)',
        }}
        onClick={() => handleKeyDown('one-tow-one')}
      >
        <img
          alt=''
          src='/package/caution.png'
          style={{
            height: `${height * 0.333}cm`,
          }}
        />
      </div>
      <div
        id="one-tow-two"
        className='box-content'
        style={{
          fontSize: barcodeAroundFontSize(height),
          textAlign: 'right',
          position: 'absolute',
          fontFamily: 'odikafont',
          right: `${length * 0.04}cm`,
          top: '50%',
          transform: 'translateY(-50%) rotate(180deg)',
        }}
        onClick={() => handleKeyDown('one-tow-two')}
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
    </>
  }


  const getRowTwoColThree = () => {
    return <>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${(width) * 0.06}cm`,
          transform: 'translateY(-50%)'
        }}
      >
        <img
          alt=''
          src='/package/odika-logo.png'
          style={{
            height: `${(height) * 0.24}cm`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: FrontSize,
          textAlign: 'right',
          position: 'absolute',
          top: '50%',
          right: `${(width) * 0.06}cm`,
          transform: 'translateY(-50%)',

        }}
      >
        {/* <span>SJW YWL</span><br /> */}
        <span>
          {
            logistics.line1
          }
        </span>
        <div>
          {myBarcode}
        </div>
        <span>{sku}</span><br />
        {/* <span>SHW WL-051</span> */}
        <span>
          {
            logistics.line2
          }
        </span>
      </div>
    </>
  }


  const getRowTowColFour = () => {
    return <>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${(width) * 0.06}cm`,
          transform: 'translateY(-50%)'
        }}
      >
        <img
          alt=''
          src={`/package/explosion/${isExplosion}.png`}
          style={{
            height: `${(height) * 0.27}cm`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: FrontSize,
          textAlign: 'right',
          position: 'absolute',
          top: '50%',
          right: `${(width) * 0.06}cm`,
          transform: 'translateY(-50%)',

        }}
      >
        {/* <span>SJW YWL</span><br /> */}
        <span>
          {
            logistics.line1
          }
        </span>
        <div>
          {myBarcode}
        </div>
        <span>{sku}</span><br />
        {/* <span>SHW WL-051</span> */}
        <span>
          {
            logistics.line2
          }
        </span>
      </div>
    </>
  }

  const content = [
    [getRowOneColOne(), null, getRowOneColThree(), null],
    [getRowTwoColOne(), getRowTwoColTwo(), getRowTwoColThree(), getRowTowColFour()],
    [null, null, null, null],
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
        width: `${(length * 4)}cm`,
        boxSizing: 'content-box',
      }}
    >
      {/* 第一行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }}>
          {content[0][0]}
        </div>
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
          }} />
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${(width / 2)}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[0][2]}
        </div>
        {/* 4 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
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
          width: `${length}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          boxSizing: 'border-box',
          display: 'inline-block',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[1][0]}
        </div>
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
          width: `${length}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[1][2]}
        </div>
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} >
          {content[1][3]}
        </div>
      </div>
      {/* 第三行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${width / 2}cm`,
          border: '1px solid #000',
          boxSizing: 'border-box',
          display: 'inline-block',
          verticalAlign: 'top',
          position: 'relative',
        }} />
        {/* 2 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${width / 2}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} />
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${width / 2}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} />
        {/* 3 */}
        <div className='box-plank' style={{
          width: `${length}cm`,
          height: `${width / 2}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }} />
      </div>
    </div>
  </>)
}

export default Package

