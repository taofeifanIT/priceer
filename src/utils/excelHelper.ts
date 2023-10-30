import XLSX from 'xlsx';




export function exportExcelFile(headers: any[], data: any[], fileName = 'demo.xlsx') {
  const jsonWorkSheet = XLSX.utils.json_to_sheet(data);
  // 设置表头
  jsonWorkSheet['!cols'] = headers.map((item) => ({ wpx: item.width }));
  const workBook: any = {
    SheetNames: ['主数据上传文件无序列号'],
    Sheets: {
      ['主数据上传文件无序列号']: jsonWorkSheet,
    }
  };
  return XLSX.writeFile(workBook, fileName);
}




/**
 * 导出excel
 * @param {*} headers
 * @param {*} data
 * @param {*} fileName
 */



const exportExcel = (headers, data, fileName = 'demo.xlsx') => {
  const _headers = headers
    .map((item, i) =>
      Object.assign(
        {},
        {
          key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1
        },
      ),
    )
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }),
      {},
    );
  const _data = data
    .map((item, i) =>
      headers.map((key, j) =>
        Object.assign(
          {},
          {
            content: item[key.key],
            position: String.fromCharCode(65 + j) + (i + 2),
            type: key.type || 's'
          },
        ),
      ),
    )
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    .reduce((prev, next) => prev.concat(next))
    // 转换成 worksheet 需要的结构
    .reduce(
      (prev, next) =>
        Object.assign({}, prev, { [next.position]: { v: next.content, t: next.type } }),
      {},
    );
  // t: isNaN(next.content) && next.content.length > 4 ? 's' : 'n'
  // 合并 headers 和 data
  const output = Object.assign({}, _headers, _data);
  // 获取所有单元格的位置
  const outputPos = Object.keys(output);
  // 计算出范围 ,["A1",..., "H2"]
  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;
  // 构建 workbook 对象
  const wb = {
    SheetNames: ['mySheet'],
    Sheets: {
      mySheet: Object.assign({}, output, {
        '!ref': ref,
        '!cols': [
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 110 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
        ],
      }),
    },
  };
  // 导出 Excel
  XLSX.writeFile(wb, fileName);
};


// 导出table为excel
const exportTableExcel = (table, fileName = 'demo.xlsx') => {
  const wb = XLSX.utils.table_to_book(table);
  XLSX.writeFile(wb, fileName);
}

export { exportExcel, exportTableExcel };
