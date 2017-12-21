var xlsx = require('node-xlsx');
var fs = require('fs');
//读取文件内容
var obj = xlsx.parse(__dirname + '/sale_info(剔除季节因素比较3个规格).xlsx');
var excelObj = obj[0].data;
var monthArr= [];
var item1Arr= [];
var item2Arr= [];
var item3Arr= [];

for(var i = 1 ; i<excelObj.length;i++){

	monthArr.push(excelObj[i][4]);
	item1Arr.push(excelObj[i][1]);
	item2Arr.push(excelObj[i][2]);
	item3Arr.push(excelObj[i][3]);
}



console.log(item2Arr);


//同步方法
//fs.writeFileSync('./sql.sql',sqlArr.join(""));
