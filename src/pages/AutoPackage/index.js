import { useEffect, useState } from 'react';
import { Input, Button, Space, Select, Upload, message, Row, Col } from 'antd'
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import MiddleSealCaseB from './components/MiddleSealCaseB';
import MiddleSealCaseA from './components/MiddleSealCaseA';
import SideSeal from './components/SideSeal';
import SkyLandBox from './components/SkyLandBox';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
const { Option } = Select;

const boxTypes = [
    '中封箱-特殊',
    '中封箱',
    '侧封箱',
    '天地箱'
]

function App() {
    const [skus, setSkus] = useState([]);
    const [boxType, setBoxType] = useState('');
    const [boxSizeInfo, setBoxSizeInfo] = useState({});
    const [way, setWay] = useState('');
    const [barcodeFrontLine1, setBarcodeFrontLine1] = useState('SHWYWL');
    const [barcodeFrontLine2, setBarcodeFrontLine2] = useState('');
    const [skuImage, setSkuImage] = useState('');
    const [box, setBox] = useState(null);

    const getSku = () => {
        axios.get('http://api-rp.itmars.net/timer/getBoxSize').then(res => {
            setSkus(res.data.data.content)
        })
    }

    const getBoxSizeBySku = (selectSku) => {
        return skus.find(item => item.Name === selectSku)
    }

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        return isJpgOrPng
    }

    const handleChange = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (e) {
            setSkuImage(e.target.result)
        }
    }

    const getIsExplosion = (packageInfo) => {
        if (packageInfo === "") {
            return "a"
        }
        if (packageInfo === "Team Lift") {
            return "b"
        }
        if (packageInfo === "Mech Lift") {
            return "c"
        }
        return "a"
    }

    const downloadImg = () => {
        // 打印一个和dom一样大小的canvas，然后转成图片
        const box = document.getElementById('box');
        html2canvas(box, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            // backgroundColor: 'transparent',
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            //  生成图片并下载
            const link = document.createElement('a');
            link.download = `${boxSizeInfo.Name}.png`;
            link.href = imgData;
            link.click();
        });
    }

    const downloadPdf = () => {
        const box = document.getElementById('box');
        html2canvas(box, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
        }).then((canvas) => {
            //  根据canvas大小生成pdf
            const imgData = canvas.toDataURL('image/png');
            let imgWidth = box.offsetWidth;
            let imgHeight = box.offsetHeight;
            // let way = 'l';
            const pdf = new jsPDF(way, 'px', [imgWidth, imgHeight], true);
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${boxSizeInfo.Name}.pdf`);
        });
    }

    const genarateEffectPicture = async () => {
        // 根据图片url获得图片的宽高  
        // const {width,height} = await getImageSize(skuImage)
        const boxProps = {
            sku: boxSizeInfo.Name,
            length: boxSizeInfo["Actual Length (cm)"],
            width: boxSizeInfo["Actual Mid (cm)"],
            height: boxSizeInfo["Actual Short (cm)"],
            logistics: {
                line1: barcodeFrontLine1,
                line2: barcodeFrontLine2
            },
            productName: boxSizeInfo["Kind of Item"],
            nw: `${boxSizeInfo["N.W."]}kg,${boxSizeInfo["N.W.(lb)"]}Lbs`,
            // gw: boxSizeInfo["G.W."],
            gw: `${boxSizeInfo["G.W."]}kg,${boxSizeInfo["G.W.(lb)"]}Lbs`,
            // gwLbs: boxSizeInfo["G.W.(lb)"],
            meas: `${boxSizeInfo["Actual Length (cm)"]}x${boxSizeInfo["Actual Mid (cm)"]}x${boxSizeInfo["Actual Short (cm)"]}cm,${boxSizeInfo["L(inch)"]}x${boxSizeInfo["W(inch)"]}x${boxSizeInfo["H(inch)"]}in`,
            // productionDate: new Date().toLocaleDateString(),
            // 月份的英语 + 年份 大写
            // productionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            productionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }).toUpperCase(),
            src: skuImage,
            isExplosion: getIsExplosion(boxSizeInfo["Package Info"]),
            manufacturer: "MADE IN CHINA"
        }
        let dom = null
        switch (boxType) {
            case '中封箱-特殊':
                dom = <MiddleSealCaseA boxInfo={boxProps} />
                break;
            case '中封箱':
                dom = <MiddleSealCaseB boxInfo={boxProps} />
                break;
            case '侧封箱':
                dom = <SideSeal boxInfo={boxProps} />
                break;
            case '天地箱':
                dom = <SkyLandBox boxInfo={boxProps} />
                break;
            default:
                break;
        }
        setBox(dom)
    }

    // 重写一个上传图片的组件，上传的图片不需要传到服务器，只需要获取图片的base64
    const uploadComponent = () => {
        return <div
            name="file"
            className="avatar-uploader"
        >
            <input type="file" accept="image/*" onChange={handleChange} /><br />
            {skuImage ? <img src={skuImage} alt="avatar" style={{ maxHeight: '200px', marginTop: '10px' }} /> : null}
        </div>
    }

    useEffect(() => {
        getSku()
        // loginGetToken()
    }, [])
    return (
        <>

            <div style={{ margin: 10 }}>
                <span>
                    <label>产品型号：</label>
                    <Select
                        style={{ width: 230 }}
                        onChange={value => {
                            setBoxSizeInfo(getBoxSizeBySku(value))
                            const boxType = skus.find(item => item.Name === value)
                            const tempBoxType = boxType["Package Box Type"]
                            if (!tempBoxType) {
                                message.warning('该sku没有箱型')
                                return
                            }
                            // 如果选择的sku，boxtypes中没有，就提示，系统没有预设该sku的箱型
                            if (!boxTypes.includes(tempBoxType)) {
                                message.warning('系统没有预设该sku的箱型')
                                return
                            }
                            setBoxType(boxType["Package Box Type"])
                        }}
                        showSearch>
                        {skus.map(item => <Option value={item.Name} key={item.Name}>{item.Name}-{(item['Package Box Type'] || <span style={{ color: 'red' }}>Not yet</span>)}</Option>)}
                    </Select>
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    <label>箱型：</label>
                    <Select
                        style={{ width: 200 }}
                        value={boxType}
                        onChange={value => {
                            setBoxType(value)
                        }}
                    >
                        {boxTypes.map(item => <Option value={item} key={item}>{item}</Option>)}
                    </Select>
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    <label>PDF打印方向：</label>
                    <Select
                        style={{ width: 80 }}
                        value={way}
                        onChange={value => {
                            setWay(value)
                        }}
                    >
                        <Option value="">竖向</Option>
                        <Option value="l">横向</Option>
                    </Select>
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    <lable>Barcode Front Line1：</lable>
                    <Input style={{ width: 100 }} value={barcodeFrontLine1} onChange={e => setBarcodeFrontLine1(e.target.value)} />
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    <lable>Barcode Front Line2：</lable>
                    <Input style={{ width: 150 }} value={barcodeFrontLine2} onChange={e => setBarcodeFrontLine2(e.target.value)} />
                </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                    type="primary"
                    disabled={!boxType || !barcodeFrontLine1 || !barcodeFrontLine2}
                    onClick={genarateEffectPicture}>
                    生成
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                    type="primary"
                    onClick={() => setBox(null)}>
                    清除
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                    type="primary"
                    disabled={!box}
                    onClick={downloadImg}>
                    下载图片
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Button
                    type="primary"
                    disabled={!box}
                    onClick={downloadPdf}>
                    下载PDF
                </Button>
                <div style={{ marginTop: '30px' }}>
                    <Space>
                        <div>
                            产品图片：
                            {uploadComponent(1)}
                        </div>
                    </Space>
                </div>
                <div />
            </div>
            {box}
        </>
    );
}

export default App;
