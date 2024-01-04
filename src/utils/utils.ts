import * as Icon from '@ant-design/icons';
import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getGlobalParams } from '@/utils/globalParams';
const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
    if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
        return true;
    }
    return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'development') {
        return true;
    }
    return isAntDesignPro();
};

export function getMenu(params: any[]): any {
    return params.map((item) => {
        let routeObj: any = {
            sort_num: item.sort_num,
            hideInMenu: !item.is_show,
            name: item.name,
            component: item.component,
            access: 'normalRouteFilter',
            path: item.component.replace('.', ''),
            icon: item.icon && React.createElement(Icon[item.icon.replace(/\s+/g, '')]),
            auth: [1, 2, 3, 4, 5, 6], // 1 查看 2 新增 3 编辑 4 删除 5 导出 6 导入
            routes: item.children
                ? getMenu(item.children).sort((a: any, b: any) => a.sort_num - b.sort_num)
                : [],
        };
        // if (item.title === 'RequirementList') {
        //     console.log('item', item);
        //     routeObj.menuRender = false;
        //     routeObj.headerRender = false;
        // }
        if (!item.is_show) {
            routeObj = {
                ...routeObj,
                target: '_blank',
                menuRender: false,
                headerRender: false,
            }
        }
        if (!routeObj.routes.length) {
            delete routeObj.routes;
        } else {
            routeObj.redirect = routeObj.routes[0].path;
            routeObj.name = item.name;
            routeObj.path = '/' + item.name;
        }
        return routeObj;
    });
}

export function createDownload(fileName: string, url: any) {
    // const type = isBinary ? 'application/octet-stream' : ''
    // const blob = new Blob([content])
    if ('download' in document.createElement('a')) {
        // 非IE下载
        const elink = document.createElement('a');
        elink.download = fileName;
        elink.style.display = 'none';
        elink.href = url;
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
    }
}

export function getQueryVariable(variable: string) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return "";
}

export function getKesGroup(
    parentKey:
        | 'companyData'
        | 'countryData'
        | 'marketPlaceData'
        | 'vendorData'
        | 'storeData'
        | 'tagsData'
        | 'configsData'
        | 'priceAlgorithmsData'
        | 'listing_sort_field',
) {
    const allKeys = getGlobalParams();
    return allKeys[parentKey];
}

export function getKesValue(
    parentKey:
        | 'company'
        | 'country'
        | 'market'
        | 'store',
    key: string | number,
) {
    const allKeys = getGlobalParams();
    return allKeys[parentKey].find((item: any) => item.key == key);
}

export function getPageHeight() {
    const pageHeight = document.body.clientHeight - 48 - 24 - 24;
    return pageHeight;
}

export function throwMenu(Arr: any[], ID: string): any {
    let _result = null;
    for (let i = 0; i < Arr.length; i++) {
        if (Arr[i].path == ID) return Arr[i];
        if (Arr[i].routes) _result = throwMenu(Arr[i].routes, ID);
        if (_result != null) return _result;
    }
    return _result;
}

export function enterF11() {
    const docElm: any = document.documentElement;
    try {
        if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    } catch (error) {
        console.log(error);
    }
}

export function findIndexPage(arr: any[]) {
    let path = '';
    for (let i = 0; i < arr.length; i++) {
        if (path) {
            continue;
        };
        if (!arr[i].routes) {
            path = arr[i].path;
        } else {
            // path = arr[i].routes[0].path;
            path = findIndexPage(arr[i].routes);
            // 跳出循环
            break;
        }
    }
    return path;
}

export const exportPDF = async (el: string, products: { fnSku: string, printQuantity: number }[], size: { width: number, height: number }) => {
    const { width, height } = size;
    const elChild = (document.getElementById(el) as any).children;
    const oddChild = Array.from(elChild).filter((item: any, index: number) => index % 2 === 1);
    const pdf = new jsPDF('l', 'mm', [width, height], true);
    const promises = oddChild.map((item: any) => {
        return html2canvas(item, {
            scale: 1,
            logging: false,
            allowTaint: true,
        })
    });
    const pdfHeight = height < 30 ? height * 0.6 : height * 0.575;
    Promise.all(promises).then((canvas) => {
        canvas.forEach((item, index) => {
            const imgData = item.toDataURL('image/png', 1.0);
            new Array(products[index].printQuantity).fill('').forEach((_, subIndex) => {
                pdf.addImage(imgData, 'JPEG', 5, 5, width - 10, pdfHeight);
                if (index !== canvas.length - 1 || subIndex !== products[index].printQuantity - 1) {
                    pdf.addPage();
                }
            });
        });
        // let pdfName = products.map(item => item.fnSku).join('-');
        pdf.save(`shipment.pdf`);
    });
};
// https://blog.csdn.net/c_kite/article/details/81364592 相关文档
export const newExportPDF = async (el: string, products: { fnSku: string, printQuantity: number }[], size: { width: number, height: number }, fileName?: string) => {
    const element: any = document.getElementById(el);
    html2canvas(element, {
        logging: false,
    }).then(function (canvas) {
        const pdf = new jsPDF('l', 'mm', [size.width, size.height], true);
        const ctx: any = canvas.getContext('2d');
        // 用canvas画布的高度来除以products的length，得到每个产品的高度
        const productHeight = canvas.height / products.length;
        // pdf高度适配
        const pdfHeight = size.height < 30 ? size.height * 0.6 : size.height * 0.575;
        products.forEach((item, index) => {
            // 截取不同高度部分的canvas
            const startHeight = productHeight * index;
            // 剪裁图片
            const imgData = ctx.getImageData(0, startHeight, canvas.width, productHeight);
            // 重新绘制canvas
            const newCanvas: any = document.createElement('canvas');
            newCanvas.width = canvas.width;
            newCanvas.height = productHeight;
            const newCtx = newCanvas.getContext('2d');
            newCtx.putImageData(imgData, 0, 0);
            // 生成图片
            const img = new Image();
            img.src = newCanvas.toDataURL('image/png', 1.0);
            // 生成pdf
            new Array(item.printQuantity).fill('').forEach((_, subIndex) => {
                pdf.addImage(img, 'JPEG', 5, 3, size.width - 10, pdfHeight);
                if (index !== products.length - 1 || subIndex !== item.printQuantity - 1) {
                    pdf.addPage();
                }
            });
            if (index === products.length - 1) {
                pdf.save(`${fileName ? fileName : 'shipment'}.pdf`);
                // 释放内存
                newCanvas.width = 0;
                newCanvas.height = 0;
                newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
                img.src = '';
            }
        });
    });
}

export const exportPDFWithFont = async (fonts: string[], size: { width: number, height: number }) => {
    const { width, height } = size;
    const pdf = new jsPDF('l', 'mm', [width, height], true);
    // 每一页的内容 fonts
    const pageContent = fonts.map((item, index) => {
        return {
            page: index + 1,
            content: item,
        }
    });
    pageContent.forEach((item, index) => {
        let fontSize = 15
        const contentArr = item.content.split('');
        const pdfWidth = width / 2
        let pdfHeight = height / 2
        if (contentArr.length > 20) {
            pdfHeight = height / 2 - 4
        } else {
            fontSize = 20
        }
        pdf.setFontSize(fontSize);
        let content = '';
        contentArr.forEach((item, index) => {
            if (index % 20 === 0 && index !== 0) {
                content += '\r';
            }
            content += item;
        });
        pdf.text(content, pdfWidth, pdfHeight, { align: 'center', baseline: 'middle' });
        if (index !== pageContent.length - 1) {
            pdf.addPage();
        }
    });
    pdf.save(`mskus.pdf`);
    const printWindow = window.open(pdf.output('bloburl'), '_blank', 'fullscreen=yes');
    if (printWindow) {
        printWindow.print();
    }
}

export const handlePrint = (id: any, num: number) => {
    // 先用html2canvas将页面整个转为一张截图，再打印，防止出现echarts无法打印
    const dom = document.getElementById(id) as any;
    html2canvas(dom, {
        scale: 2,
        width: dom.offsetWidth,
        height: dom.offsetHeight,
    }).then((canvas) => {
        const context = canvas.getContext('2d') as any;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        const src64 = canvas.toDataURL();
        const img = new Image();
        img.setAttribute('src', src64);
        // 控制纸张大小
    });
};

function stringToDate(dateString: string) {
    // eslint-disable-next-line no-param-reassign
    const date = dateString.split('-');
    return new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]));
}


export function countWorkDay(date1: string, date2: string) {
    let date1Temp = stringToDate(date1);
    const date2Temp = stringToDate(date2);
    const delta = (date2Temp - date1Temp) / (1000 * 60 * 60 * 24) + 1; // 计算出总时间
    let weeks = 0;
    for (let i = 0; i < delta; i++) {
        if (date1Temp.getDay() == 0 || date1Temp.getDay() == 6) weeks++;  // 若为周六或周天则加1
        date1Temp = date1Temp.valueOf();
        date1Temp += 1000 * 60 * 60 * 24;
        date1Temp = new Date(date1Temp);
    }
    return delta - weeks;
}


export const URLS = {
    dev: '',
    test: ''
}

export const getImageUrl = (baseUrl: string) => {
    return API_URL + '/storage/' + baseUrl
}


// 传入domID 生成图片并下载图片
export const createImage = (domId: string) => {
    const element: any = document.getElementById(domId);
    html2canvas(element, {
        logging: false,
        // 最大保真
        scale: 3.5,
    }).then(function (canvas) {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = imgData;
        link.click();
    });
}

export const downloadPdf = (el: string, title: string) => {
    // 如果这个页面有左右移动,canvas 也要做响应的移动，不然会出现canvas 内容不全
    const xOffset = window.pageXOffset
    // 避免笔下误 灯下黑 统一写
    const A4_WIDTH = 592.28
    // const A4_HEIGHT = 841.89
    const A4_HEIGHT = 841.89
    const printDom = document.getElementById(el)
    // 根据A4的宽高计算DOM页面一页应该对应的高度
    const pageHeight = printDom.offsetWidth / A4_WIDTH * A4_HEIGHT
    // 将所有不允许被截断的元素进行处理
    let wholeNodes = document.querySelectorAll('.whole-node')
    for (let i = 0; i < wholeNodes.length; i++) {
        //1、 判断当前的不可分页元素是否在两页显示
        const topPageNum = Math.ceil((wholeNodes[i].offsetTop) / pageHeight)
        const bottomPageNum = Math.ceil((wholeNodes[i].offsetTop + wholeNodes[i].offsetHeight) / pageHeight)
        if (topPageNum !== bottomPageNum) {
            //说明该dom会被截断
            // 2、插入空白块使被截断元素下移
            let divParent = wholeNodes[i].parentNode
            let newBlock = document.createElement('div')
            newBlock.className = 'emptyDiv'
            newBlock.style.background = '#fff'

            // 3、计算插入空白块的高度 可以适当流出空间使得内容太靠边，根据自己需求而定
            let _H = topPageNum * pageHeight - wholeNodes[i].offsetTop
            // newBlock.style.height = _H + 148 + 'px'
            // divParent.insertBefore(newBlock, wholeNodes[i])
            // 空白块高度等于剩余可用高度
            newBlock.style.height = _H + 30 + 'px'
            divParent.insertBefore(newBlock, wholeNodes[i])
            wholeNodes = document.querySelectorAll('.whole-node')
        }

    }
    const PDF = new jsPDF('', 'pt', 'a4')
    html2canvas(printDom, { height: printDom.offsetHeight, width: printDom.offsetWidth, scrollX: -xOffset, allowTaint: true, scale: 2 }).then(canvas => {
        //dom 已经转换为canvas 对象，可以将插入的空白块删除了
        const emptyDivs = document.querySelectorAll('.emptyDiv')
        for (let i = 0; i < emptyDivs.length; i++) {
            emptyDivs[i].parentNode.removeChild(emptyDivs[i])
        }
        // 有一点重复的代码
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        const pageHeight = contentWidth / A4_WIDTH * A4_HEIGHT
        let leftHeight = contentHeight
        let position = 0

        const imgWidth = A4_WIDTH
        const imgHeight = A4_WIDTH / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        //   if (isPrint) {
        //     //如果是打印，可以拿着分号页的数据 直接使用
        //     printJs({ printable: pageData, type: 'image', base64: true, documentTitle: '\u200E' })
        //     return
        //   }
        //计算分页的pdf 

        if (leftHeight <= pageHeight + 10) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth + 3, imgHeight)
        } else {
            while (leftHeight > 0) {
                PDF.addImage(pageData, 'JPEG', 0, position, imgWidth + 3, imgHeight)
                leftHeight -= pageHeight
                position -= A4_HEIGHT
                if (leftHeight > 0) {
                    PDF.addPage()
                }
            }
        }
        PDF.save(title + '.pdf')
        const printWindow = window.open(PDF.output('bloburl'), '_blank', 'fullscreen=yes');
        if (printWindow) {
            printWindow.print();
        }
    })
}


// A4纸横向打印
export const downloadPdfAcross = (el: string, title: string) => {
    // 如果这个页面有左右移动,canvas 也要做响应的移动，不然会出现canvas 内容不全
    const xOffset = window.pageXOffset
    // 避免笔下误 灯下黑 统一写
    const A4_WIDTH = 841.89
    const A4_HEIGHT = 592.28
    const printDom = document.getElementById(el)
    // 根据A4的宽高计算DOM页面一页应该对应的高度
    const pageHeight = printDom.offsetWidth / A4_WIDTH * A4_HEIGHT
    // 将所有不允许被截断的元素进行处理
    let wholeNodes = document.querySelectorAll('.whole-node')
    for (let i = 0; i < wholeNodes.length; i++) {
        //1、 判断当前的不可分页元素是否在两页显示
        const topPageNum = Math.ceil((wholeNodes[i].offsetTop) / pageHeight)
        const bottomPageNum = Math.ceil((wholeNodes[i].offsetTop + wholeNodes[i].offsetHeight) / pageHeight)
        if (topPageNum !== bottomPageNum) {
            //说明该dom会被截断
            // 2、插入空白块使被截断元素下移
            let divParent = wholeNodes[i].parentNode
            let newBlock = document.createElement('div')
            newBlock.className = 'emptyDiv'
            newBlock.style.background = '#fff'

            // 3、计算插入空白块的高度 可以适当流出空间使得内容太靠边，根据自己需求而定
            let _H = topPageNum * pageHeight - wholeNodes[i].offsetTop
            // newBlock.style.height = _H + 148 + 'px'
            // divParent.insertBefore(newBlock, wholeNodes[i])
            // 空白块高度等于剩余可用高度
            newBlock.style.height = _H + 30 + 'px'
            divParent.insertBefore(newBlock, wholeNodes[i])
            wholeNodes = document.querySelectorAll('.whole-node')
        }

    }
    const PDF = new jsPDF('l', 'pt', 'a4')
    html2canvas(printDom, { height: printDom.offsetHeight, width: printDom.offsetWidth, scrollX: -xOffset, allowTaint: true, scale: 2 }).then(canvas => {
        //dom 已经转换为canvas 对象，可以将插入的空白块删除了
        const emptyDivs = document.querySelectorAll('.emptyDiv')
        for (let i = 0; i < emptyDivs.length; i++) {
            emptyDivs[i].parentNode.removeChild(emptyDivs[i])
        }
        // 有一点重复的代码
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        const pageHeight = contentWidth / A4_WIDTH * A4_HEIGHT
        let leftHeight = contentHeight
        let position = 0

        const imgWidth = A4_WIDTH
        const imgHeight = A4_WIDTH / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        //   if (isPrint) {
        //     //如果是打印，可以拿着分号页的数据 直接使用
        //     printJs({ printable: pageData, type: 'image', base64: true, documentTitle: '\u200E' })
        //     return
        //   }
        //计算分页的pdf 

        if (leftHeight <= pageHeight + 10) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth + 3, imgHeight)
        } else {
            while (leftHeight > 0) {
                PDF.addImage(pageData, 'JPEG', 0, position, imgWidth + 3, imgHeight)
                leftHeight -= pageHeight
                position -= A4_HEIGHT
                if (leftHeight > 0) {
                    PDF.addPage()
                }
            }
        }
        PDF.save(title + '.pdf')
        const printWindow = window.open(PDF.output('bloburl'), '_blank', 'fullscreen=yes');
        if (printWindow) {
            printWindow.print();
        }
    })
}

// const getLengthwaysPdfObj = async (el) => {
//     const PDF = new jsPDF('', 'pt', 'a4')
//     return new Promise((resolve) => {
//         const xOffset = window.pageXOffset
//         const A4_WIDTH = 592.28
//         const A4_HEIGHT = 841.89
//         const printDom = document.getElementById(el)
//         const pageHeight = printDom.offsetWidth / A4_WIDTH * A4_HEIGHT
//         let wholeNodes = document.querySelectorAll('.whole-node')
//         for (let i = 0; i < wholeNodes.length; i++) {
//             const topPageNum = Math.ceil((wholeNodes[i].offsetTop) / pageHeight)
//             const bottomPageNum = Math.ceil((wholeNodes[i].offsetTop + wholeNodes[i].offsetHeight) / pageHeight)
//             if (topPageNum !== bottomPageNum) {
//                 let divParent = wholeNodes[i].parentNode
//                 let newBlock = document.createElement('div')
//                 newBlock.className = 'emptyDiv'
//                 newBlock.style.background = '#fff'
//                 let _H = topPageNum * pageHeight - wholeNodes[i].offsetTop
//                 newBlock.style.height = _H + 30 + 'px'
//                 divParent.insertBefore(newBlock, wholeNodes[i])
//                 wholeNodes = document.querySelectorAll('.whole-node')
//             }
//         }
//         html2canvas(printDom, { height: printDom.offsetHeight, width: printDom.offsetWidth, scrollX: -xOffset, allowTaint: true, scale: 2 }).then(canvas => {
//             const emptyDivs = document.querySelectorAll('.emptyDiv')
//             for (let i = 0; i < emptyDivs.length; i++) {
//                 emptyDivs[i].parentNode.removeChild(emptyDivs[i])
//             }
//             const contentWidth = canvas.width
//             const contentHeight = canvas.height
//             const pageHeight = contentWidth / A4_WIDTH * A4_HEIGHT
//             let leftHeight = contentHeight
//             let position = 0
//             const imgWidth = A4_WIDTH
//             const imgHeight = A4_WIDTH / contentWidth * contentHeight
//             const pageData = canvas.toDataURL('image/jpeg', 1.0)
//             if (leftHeight <= pageHeight + 10) {
//                 PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth + 3, imgHeight)
//             } else {
//                 while (leftHeight > 0) {
//                     PDF.addImage(pageData, 'JPEG', 0, position, imgWidth + 3, imgHeight)
//                     console.log('position', position);
//                     leftHeight -= pageHeight
//                     position -= A4_HEIGHT
//                     if (leftHeight > 0) {
//                         PDF.addPage()
//                     }
//                 }
//             }
//             resolve({
//                 PDF,
//                 position,
//             })
//         })
//     })
// }


// const getAcrossPdfObj = async (el) => {
//     const PDF = new jsPDF('l', 'pt', 'a4')
//     return new Promise((resolve) => {
//         const xOffset = window.pageXOffset
//         // 避免笔下误 灯下黑 统一写
//         const A4_WIDTH = 841.89
//         const A4_HEIGHT = 592.28
//         const printDom = document.getElementById(el)
//         const pageHeight = printDom.offsetWidth / A4_WIDTH * A4_HEIGHT
//         let wholeNodes = document.querySelectorAll('.whole-node')
//         for (let i = 0; i < wholeNodes.length; i++) {
//             const topPageNum = Math.ceil((wholeNodes[i].offsetTop) / pageHeight)
//             const bottomPageNum = Math.ceil((wholeNodes[i].offsetTop + wholeNodes[i].offsetHeight) / pageHeight)
//             if (topPageNum !== bottomPageNum) {
//                 let divParent = wholeNodes[i].parentNode
//                 let newBlock = document.createElement('div')
//                 newBlock.className = 'emptyDiv'
//                 newBlock.style.background = '#fff'
//                 let _H = topPageNum * pageHeight - wholeNodes[i].offsetTop
//                 newBlock.style.height = _H + 30 + 'px'
//                 divParent.insertBefore(newBlock, wholeNodes[i])
//                 wholeNodes = document.querySelectorAll('.whole-node')
//             }

//         }
//         html2canvas(printDom, { height: printDom.offsetHeight, width: printDom.offsetWidth, scrollX: -xOffset, allowTaint: true, scale: 2 }).then(canvas => {
//             const emptyDivs = document.querySelectorAll('.emptyDiv')
//             for (let i = 0; i < emptyDivs.length; i++) {
//                 emptyDivs[i].parentNode.removeChild(emptyDivs[i])
//             }
//             const contentWidth = canvas.width
//             const contentHeight = canvas.height
//             const pageHeight = contentWidth / A4_WIDTH * A4_HEIGHT
//             let leftHeight = contentHeight
//             let position = 0
//             const imgWidth = A4_WIDTH
//             const imgHeight = A4_WIDTH / contentWidth * contentHeight
//             const pageData = canvas.toDataURL('image/jpeg', 1.0)
//             if (leftHeight <= pageHeight) {
//                 PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth + 3, imgHeight)
//             } else {
//                 while (leftHeight > 0) {
//                     PDF.addImage(pageData, 'JPEG', 0, position, imgWidth + 3, imgHeight)
//                     leftHeight -= pageHeight
//                     position -= A4_HEIGHT
//                     if (leftHeight > 0) {
//                         PDF.addPage()
//                     }
//                 }
//             }
//             resolve({
//                 PDF,
//                 position,

//             })
//         })
//     })
// }
export const printAllReport = async (el: string, title: string) => {
    // ['generateDeclarationInformationTable', 'customsManifestTable', 'customsDeclaration']
    // 如果这个页面有左右移动,canvas 也要做响应的移动，不然会出现canvas 内容不全
    const xOffset = window.pageXOffset
    // 避免笔下误 灯下黑 统一写
    const A4_WIDTH = 841.89
    // const A4_HEIGHT = 841.89
    const A4_HEIGHT = 592.28
    const printDom = document.getElementById(el)
    // 根据A4的宽高计算DOM页面一页应该对应的高度
    const pageHeight = printDom.offsetWidth / A4_WIDTH * A4_HEIGHT
    // 将所有不允许被截断的元素进行处理
    let wholeNodes = document.querySelectorAll('.whole-node')
    // const doms = 
    for (let i = 0; i < wholeNodes.length; i++) {
        //1、 判断当前的不可分页元素是否在两页显示
        const topPageNum = Math.ceil((wholeNodes[i].offsetTop) / pageHeight)
        const bottomPageNum = Math.ceil((wholeNodes[i].offsetTop + wholeNodes[i].offsetHeight) / pageHeight)
        if (topPageNum !== bottomPageNum) {
            //说明该dom会被截断
            // 2、插入空白块使被截断元素下移
            let divParent = wholeNodes[i].parentNode
            let newBlock = document.createElement('div')
            newBlock.className = 'emptyDiv'
            newBlock.style.background = '#fff'

            // 3、计算插入空白块的高度 可以适当流出空间使得内容太靠边，根据自己需求而定
            let _H = topPageNum * pageHeight - wholeNodes[i].offsetTop
            // newBlock.style.height = _H + 148 + 'px'
            // divParent.insertBefore(newBlock, wholeNodes[i])
            // 空白块高度等于剩余可用高度
            newBlock.style.height = _H + 0 + 'px'
            divParent.insertBefore(newBlock, wholeNodes[i])
            wholeNodes = document.querySelectorAll('.whole-node')
        }

    }
    // 将所有不允许被分页显示的元素进行处理
    let noPageNodes = document.querySelectorAll('.no-page')
    for (let i = 0; i < noPageNodes.length; i++) {
        //1、 判断当前的不可分页元素是否在两页显示
        const topPageNum = Math.ceil((noPageNodes[i].offsetTop) / pageHeight)
        const bottomPageNum = Math.ceil((noPageNodes[i].offsetTop + noPageNodes[i].offsetHeight) / pageHeight)
        if (topPageNum !== bottomPageNum) {
            //说明该dom会被截断
            // 2、插入空白块使被截断元素下移
            let divParent = noPageNodes[i].parentNode
            let newBlock = document.createElement('div')
            newBlock.className = 'emptyDiv'
            newBlock.style.background = '#fff'

            // 3、计算插入空白块的高度 可以适当流出空间使得内容太靠边，根据自己需求而定
            let _H = topPageNum * pageHeight - noPageNodes[i].offsetTop
            // newBlock.style.height = _H + 148 + 'px'
            // divParent.insertBefore(newBlock, wholeNodes[i])
            // 空白块高度等于剩余可用高度
            newBlock.style.height = _H + 0 + 'px'
            divParent.insertBefore(newBlock, noPageNodes[i])
            noPageNodes = document.querySelectorAll('.no-page')
        }

    }
    const PDF = new jsPDF('l', 'pt', 'a4')
    html2canvas(printDom, { height: printDom.offsetHeight, width: printDom.offsetWidth, scrollX: -xOffset, allowTaint: true, scale: 2 }).then(canvas => {
        //dom 已经转换为canvas 对象，可以将插入的空白块删除了
        const emptyDivs = document.querySelectorAll('.emptyDiv')
        for (let i = 0; i < emptyDivs.length; i++) {
            emptyDivs[i].parentNode.removeChild(emptyDivs[i])
        }
        // 有一点重复的代码
        const contentWidth = canvas.width
        const contentHeight = canvas.height
        const pageDomHeight = contentWidth / A4_WIDTH * A4_HEIGHT  //pageDomHeight
        let leftHeight = contentHeight
        let position = 0

        const imgWidth = A4_WIDTH
        const imgHeight = A4_WIDTH / contentWidth * contentHeight
        const pageData = canvas.toDataURL('image/jpeg', 1.0)
        //   if (isPrint) {
        //     //如果是打印，可以拿着分号页的数据 直接使用
        //     printJs({ printable: pageData, type: 'image', base64: true, documentTitle: '\u200E' })
        //     return
        //   }
        //计算分页的pdf 

        if (leftHeight <= pageDomHeight + 10) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth + 3, imgHeight)
        } else {
            while (leftHeight > 0) {
                PDF.addImage(pageData, 'JPEG', 0, position, imgWidth + 3, imgHeight)
                leftHeight -= pageDomHeight
                position -= A4_HEIGHT
                if (leftHeight > 0) {
                    PDF.addPage()
                }
            }
        }
        PDF.save(title + '.pdf')
        // const printWindow = window.open(PDF.output('bloburl'), '_blank', 'fullscreen=yes');
        // if (printWindow) {
        //     printWindow.print();
        // }
    })
}


// 判断数字小数点后是否有两位，没有则补0
export const checkDecimal = (num: number) => {
    const str = num.toString()
    const index = str.indexOf('.')
    if (index !== -1) {
        const decimal = str.substring(index + 1, str.length)
        if (decimal.length < 2) {
            return `${num}0`
        }
        return num
    }
    return `${num}.00`
}