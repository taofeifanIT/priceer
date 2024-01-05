import React from 'react'
import Barcode from '../Barcode';
import './style.css'
import StyleTrimmer from '../StyleTrimmer';
import { Address as address } from './basicInfo'


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
    // const { sku, length, width, height } = size
    const FrontSize = getFontSize()
    const [currentEditId, setCurrentEditId] = React.useState(null)
    const [style, setStyle] = React.useState({});


    const myBarcode = <Barcode 
    value={sku} 
    displayValue={false}  
    height={cmToPx(height/4)}
    width={cmToPx(height/12) /9}
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
      for(let i=0;i<boxPlanks.length;i++){
        if(boxPlanks[i].id !== domId){
          boxPlanks[i].classList.remove('clickDiv')
        }
      }
    }
    // 监听鼠标事件
    document.onmousedown = (e) => {
      // 获取当前点击的dom的class
      const className = e.target.className
      // 如果点击的不是box-content
      const whiteList = ['box-content','style-editor-ul','style-editor-li','style-editor-lable','style-editor-input','style-editor-h2','style-editor-div','style-editor-container']
      if(!whiteList.includes(className)){
        // 移除所有box-content的选中样式
        const boxPlanks = document.getElementsByClassName('box-content')
        for(let i=0;i<boxPlanks.length;i++){
          boxPlanks[i].classList.remove('clickDiv')
        }
        setCurrentEditId(null)
      }
    }
    // 监听键盘事件
    // document.onkeydown = (e) => {
    //   if(currentEditId){
    //     // 移动选中的box-plank  通过 awsd键和上下左右键
    //     const dom = document.getElementById(currentEditId)
    //     const { left, right,top,bottom } = dom.style
    //     // 转译去除单位
    //     let x = (left || right).replace(/[^0-9.]/ig,"")
    //     let y = (top || bottom).replace(/[^0-9.]/ig,"")
    //     let newX = x
    //     let newY = y

    //     // 有的是left 有的是right，有的是top 有的是bottom，所以要判断加减符号
    //     let leftSymbol = left && -0.1
    //     let rightSymbol = right && 0.1
    //     let topSymbol = top && 0.1
    //     let bottomSymbol = bottom && -0.1
    //     switch (e.key) {
    //       case 'ArrowUp':
    //         newY = `${parseFloat(y) + topSymbol}cm`
    //         break;
    //       case 'ArrowDown':
    //         newY = `${parseFloat(y) + bottomSymbol}cm`
    //         break;
    //       case 'ArrowLeft':
    //         newX = `${parseFloat(x) + leftSymbol}cm`
    //         break;
    //       case 'ArrowRight':
    //         newX = `${parseFloat(x) + rightSymbol}cm`
    //         break;
    //       // awsd
    //       case 'w':
    //         newY = `${parseFloat(y) + 0.1}cm`
    //         break;
    //       case 's':
    //         newY = `${parseFloat(y) - 0.1}cm`
    //         break;
    //       case 'a':
    //         newX = `${parseFloat(x) - 0.1}cm`
    //         break;
    //       case 'd':
    //         newX = `${parseFloat(x) + 0.1}cm`
    //         break;
    //       default:
    //         return;
    //     }
    //     // dom.style.left = newX
    //     // dom.style.bottom = newY
    //     // 判断是left还是right，top还是bottom
    //     if(left){
    //       dom.style.left = newX
    //     }
    //     if(right){
    //       dom.style.right = newX
    //     }
    //     if(top){
    //       dom.style.top = newY
    //     }
    //     if(bottom){
    //       dom.style.bottom = newY
    //     }
    //     // 保存当前的样式
    //     const computedStyles = window.getComputedStyle(dom);
    //     const stylesObject = {};
    //     for (let i = 0; i < computedStyles.length; i++) {
    //       const propertyName = computedStyles[i];
    //       stylesObject[propertyName] = computedStyles.getPropertyValue(propertyName);
    //     }
    //     setStyle(stylesObject)
    //   }
    // }
    const getOneRowTowlineContent = () => {
        return <>
                 <div
                  id="one-tow-one"
                  className='box-content'
                  style={{ 
                    position: 'absolute',
                    fontWeight: 'bold',
                    // left: `${cmToPx(size.length) * 0.06}px`,
                    left: `${length * 0.04}cm`,
                    top: '50%',
                    transform: 'translateY(-50%)',
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
                  textAlign: 'left',
                  position: 'absolute',
                  fontFamily: 'odikafont',
                  right: `${length * 0.04}cm`,
                  top: '50%',
                  transform: 'translateY(-50%)',
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
                  <span>{sku}</span><br/>
                  <span>
                    {
                      logistics.line2
                    }
                  </span>
                </div>
              </div>
        </>
    }
    const getTowRowOneLineContent = () => {
        return <>
            <div
                id="tow-one-one"
                className='box-content'
                style={{ 
                  fontSize:barcodeAroundFontSize(height),
                  textAlign: 'left',
                  position: 'absolute',
                  fontFamily: 'odikafont',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%) rotate(90deg)',
                }}
                onClick={() => handleKeyDown('tow-one-one')}
              >
                <span>{logistics.line1}</span>
                <div>
                    {myBarcode}
                </div>
                <span>{sku}</span><br/>
                <span>
                  {
                    logistics.line2
                  }
                </span>
            </div>
        </>
    }
    const getTowRowThreeLineContent = () => {
        return <>
             <div
                id="tow-three-one"
                className='box-content'
                style={{ 
                  fontSize:barcodeAroundFontSize(height),
                  textAlign: 'right',
                  position: 'absolute',
                  fontFamily: 'odikafont',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%) rotate(-90deg)',
                }}
                onClick={() => handleKeyDown('tow-three-one')}
              >
                <span>{logistics.line1}</span>
                <div>
                    {myBarcode}
                </div>
                <span>{sku}</span><br/>
                <span>{logistics.line2}</span>
          </div>
        </>
    }
    const getTowRowTowLineContent = () => {
        return <>
              <img
                id="four-tow-one"
                className='box-content' 
                alt='' 
                src='/package/odika-logo.png' 
                style={{
                    height: `${(width/2)* 0.26 }cm`,
                    position: 'absolute',
                    top: `${width * 0.12}cm`,
                    left: `${length * 0.04}cm`,
                }} 
                onClick={() => handleKeyDown('four-tow-one')}
              />
           <div
              id="four-tow-two"
              className='box-content'
              style={{
                  fontSize: FrontSize,
                  position: 'absolute',
                  fontFamily: 'odikafontBold',
                  left: `${length * 0.04}cm`,
                  bottom: `${width * 0.12}cm`,
                }}
              onClick={() => handleKeyDown('four-tow-two')}
            >
            <span>QTY:1pc</span><br/>
            <span>N.W.:{nw}</span><br/>
            <span>G.W.:{gw}</span><br/>
            <span>MEAS:{meas}</span><br/>
            <span>PRODUCTION DATE: {productionDate}</span><br/>
          </div>
          <img 
            id='four-tow-three'
            className='box-content'
            alt='' 
            src={src} 
            style={{
                height: `${(length/2)* 0.52}cm`,
                position: 'absolute',
                bottom: `${width * 0.12}cm`,
                right: `${length * 0.04}cm`,
            }} 
            onClick={() => handleKeyDown('four-tow-three')}
          />
        </>
    }
    const getThreeRowTowLineContent = () => {
        return <>
                <div
                  id="five-tow-one"
                  className='box-content'
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    fontWeight: 'bold',
                    transform: 'translateY(-50%)',
                    left: `${cmToPx(length) * 0.04}px`,
                  }}
                  onClick={() => handleKeyDown('five-tow-one')}>
                    <img 
                      alt='' 
                      src={`/package/explosion/${isExplosion}.png`}
                      style={{
                        height: `${height * 0.33}cm`,
                      }}
                      />
                </div>
                <div
                  id="five-tow-two"
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
                  onClick={() => handleKeyDown('five-tow-two')}>
                    <span>
                        {
                            logistics.line1
                        }
                    </span><br />
                <div>
                {myBarcode}
              </div>
            <span>{sku}</span><br/>
            <span>
                {
                    logistics.line2
                }
            </span>
          </div>
        </>
    }
    const getFourRowTowLineContent = () => {
        return <>
             <div
                id='tow-tow-one'
                className='box-content'
                style={{ 
                    fontSize:  FrontSize,
                    position: 'absolute',
                    fontFamily: 'odikafontBold',
                    left: `${length * 0.04}cm`,
                    bottom: `${width * 0.12}cm`,
                }}
                onClick={() => handleKeyDown('tow-tow-one')}
                >
                <span>{productName}</span><br/>
                <span>{sku}</span><br/>
                <span>{manufacturer}</span>
             </div>
             <img 
                id="tow-tow-two"
                className='box-content'
                alt='' 
                src='/odika-logo.png' 
                style={{
                  height: `${(width/2) * 0.3}cm`,
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }} 
                onClick={() => handleKeyDown('tow-tow-two')}
              />
             <div
                id="tow-tow-three"
                className='box-content'
                style={{ 
                  fontSize:  FrontSize,
                  textAlign: 'right',
                  position: 'absolute',
                  fontFamily: 'odikafontBold',
                  right: `${length * 0.04}cm`,
                  bottom: `${width * 0.12}cm`,
                }}
                onClick={() => handleKeyDown('tow-tow-three')}
                >
                <span>Distributed By:</span><br/>
                <span>{address.line1}</span><br/>
                <span>{address.line2}</span><br/>
                <span>{address.line3}</span><br/>
                <span>{address.line4}</span><br/>
            </div>
        </>
    }
    const content = [
        // 第一行
        [null,null,null],
        // 第二行
        [null,getFourRowTowLineContent(),null],
        // 第三行
        [null,getOneRowTowlineContent(),null],
        // 第四行
        [getTowRowOneLineContent(),getTowRowTowLineContent(),getTowRowThreeLineContent()],
        // 第五行
        [null,getThreeRowTowLineContent(),null],
    ]
    const getContent = (row,col) => {
        return content[row-1][col-1]
    }
    return (<>
    <StyleTrimmer domId={currentEditId} styleObj={style} />
      <div 
        className='box' 
        id='box'
        style={{
          width: `${(Number(height) * 2 + Number(length))}cm`,
          boxSizing: 'border-box',
        }}
    >
      {/* 第一行 */}
      <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          border: '1px solid #000',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          display: 'inline-block'
        }}>
            {getContent(1,1)}
        </div>
        {/* 2 */}
        <div 
          className='box-plank' 
          style={{
            width: `${length}cm`,
            height: `${height}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
            position: 'relative',
        }} >
            {getContent(1,2)}
      </div>
       {/* 3 */}
       <div 
          className='box-plank'  
          style={{
              width: `${height}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              display: 'inline-block'
          }}>
            {getContent(1,3)}
        </div>
      </div>
      {/* 第二行 */}
      <div>
        {/* 1 */}
        <div 
          className='box-plank' 
          style={{
              width: `${height}cm`,
              height: `${width}cm`,
              border: '1px solid #000',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              display: 'inline-block'
          }}>
            {getContent(2,1)}
        </div>
        {/* 2 */}
        <div 
          className='box-plank' 
          style={{
              width: `${length}cm`,
              height: `${width}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              position: 'relative',
        }} >
            {getContent(2,2)}
        </div>
        {/* 3 */}
        <div 
          className='box-plank'  
          style={{
              width: `${height}cm`,
              height: `${width}cm`,
              border: '1px solid #000',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              display: 'inline-block'
        }}>
            {getContent(2,3)}
        </div>
      </div>
      {/* 第三行 */}
        <div>
        {/* 1 */}
        <div 
          className='box-plank' 
          style={{
              width: `${height}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              display: 'inline-block'
          }}>
            {getContent(3,1)}
        </div>
        {/* 2 */}
        <div 
          className='box-plank' 
          style={{
              width: `${length}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              display: 'inline-block',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              position: 'relative',
        }} >
            {getContent(3,2)}
      </div>
       {/* 3 */}
       <div 
          className='box-plank'  
          style={{
              width: `${height}cm`,
              height: `${height}cm`,
              border: '1px solid #000',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              display: 'inline-block'
          }}>
            {getContent(3,3)}
        </div>
      </div>
      {/* 第四行 */}
        <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${width}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }}>
            {getContent(4,1)}
        </div>
        {/* 2 */}
        <div 
          className='box-plank' 
          style={{
            width: `${length}cm`,
            height: `${width}cm`,
            border: '1px solid #000',
            display: 'inline-block',
            boxSizing: 'border-box',
            verticalAlign: 'top',
            position: 'relative',
        }} >
            {getContent(4,2)}
        </div>
        {/* 3 */}
        <div className='box-plank'  style={{
          width: `${height}cm`,
          height: `${width}cm`,
          border: '1px solid #000',
          display: 'inline-block',
          boxSizing: 'border-box',
          verticalAlign: 'top',
          position: 'relative',
        }}>
            {getContent(4,3)}
        </div>
      </div>
      {/* 第五行 */}
        <div>
        {/* 1 */}
        <div className='box-plank' style={{
          width: `${height}cm`,
          height: `${height}cm`,
          display: 'inline-block',
          border: 'none',
          borderRight: '1px solid #000',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
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
            {getContent(5,2)}
      </div>
       {/* 3 */}
       <div className='box-plank'  style={{
          width: `${height}cm`,
          height: `${height}cm`,
          display: 'inline-block',
          border: 'none',
          borderLeft: '1px solid #000',
          boxSizing: 'border-box',
          verticalAlign: 'top',
        }} />
      </div>
  </div>
    </>)
}

export default Package

