import React, { useState, useEffect } from 'react';
import styled from 'styled-components';



// 写一个悬浮在页面上的编辑器，可以编辑页面上任意元素的样式，编辑器的样式如下：
// 1. 点击编辑按钮，编辑器会显示出来，点击完成编辑按钮，编辑器会隐藏起来
// 2. 编辑器中会显示当前元素的所有样式，每个样式都可以编辑
// 3. 编辑器中的样式修改后，会立即应用到页面上的元素上
const StyleDiv = styled.div`
  width: 20%;
  height: 100%;
  background-color: #fff;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999;
  padding: 10px;
  border-left: 1px solid #ccc;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  font-size: calc(1vh + 1vmin);
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  h2 {
    font-size: 16px;
    margin: 0 0 10px 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin: 0 0 10px 0;
      label {
        display: inline-block;
        width: 100%;
        font-size: calc(1vh + 1vmin);
      }
      input {
        width: calc(100% - 100px);
      }
    }
  }
  input {
    width: calc(100% - 100px);
    height: 2vh;
    font-size: calc(1vh + 1vmin);
    border: 1px solid #ccc;
    border-radius: 2px;
  }
`;

// 需要编辑的样式
const stylesProperties = {
  // 'width': {
  //   type: 'number',
  //   step: 1,
  //   unit: 'px',
  // },
  'height': {
    type: 'number',
    step: 1,
    unit: 'px',
  },
  'font-size': {
    type: 'number',
    step: 1,
    unit: 'px',
  },
  'text-align': {
    type: 'text',
    options: ['left', 'center', 'right'],
  },
}

const StyleEditor = ({ domId, styleObj }) => {
  const [styles, setStyles] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const targetElement = document.getElementById(domId);
    if (targetElement) {
      const computedStyles = window.getComputedStyle(targetElement);
      const stylesObject = {};
      for (let i = 0; i < computedStyles.length; i++) {
        const propertyName = computedStyles[i];
        stylesObject[propertyName] = computedStyles.getPropertyValue(propertyName);
      }
      setStyles(styleObj);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [domId, styleObj]);

  const handleStyleChange = (property, value) => {
    setStyles((prevStyles) => ({
      ...prevStyles,
      [property]: value,
    }));

    // Apply the style changes to the actual DOM element
    const targetElement = document.getElementById(domId);
    if (targetElement) {
      targetElement.style[property] = value;
    }
  };

  return (
    <div className="style-editor">
      {isEditing && (
        <StyleDiv>
          <div className="style-editor-container">
            <h2>Styles for #{domId}</h2>
            <ul className='style-editor-ul'>
              {Object.keys(stylesProperties).map((property) => (
                <li key={property} className='style-editor-li'>
                  <label className='style-editor-lable'>{property}:</label>
                  <input
                    type={stylesProperties[property].type}
                    className='style-editor-input'
                    value={styles[property].replace('px', '')}
                    onChange={(e) => {
                      handleStyleChange(property, e.target.value + 'px');
                      // 如果是Height  则把width也改变
                      if (property === 'height') {
                        handleStyleChange('width', '');
                      }
                    }}
                  />
                </li>
              ))}
              {/* {Object.keys(stylesProperties).map((property) => (
              <li key={property} className='style-editor-li'>
                <label className='style-editor-lable'>{property}:</label>
                {stylesProperties[property].type === 'select' ? (
                  <select
                    className='style-editor-input'
                    value={styles[property]}
                    onChange={(e) => handleStyleChange(property, e.target.value)}
                  >
                    {stylesProperties[property].options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={stylesProperties[property].type}
                    step={stylesProperties[property].step}
                    className='style-editor-input'
                    value={styles[property]}
                    onChange={(e) => handleStyleChange(property, e.target.value)}
                  />
                )}
              </li>
            ))} */}
            </ul>
          </div>
        </StyleDiv>
      )}
    </div>
  );
};

export default StyleEditor;
