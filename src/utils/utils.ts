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
    if (routeObj.name === 'Checked') {
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
  arr.forEach((item) => {
    if (!item.routes) {
      path = item.path;
    } else {
      path = item.routes[0].path;
    }
  });
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
      }
    });
  });
}
