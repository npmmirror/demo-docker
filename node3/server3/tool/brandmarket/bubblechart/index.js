var xlsx = require('node-xlsx');
var fs = require('fs');
//读取文件内容
var obj = xlsx.parse(__dirname + '/sale_info(13-17)_160-250_trend.xlsx');
var excelObj = obj[0].data;

var years = {};
var items = {};
var dataObj = {};
var priceA = "";

var sqlArr = [];
for(var i in excelObj) {
	var item = excelObj[i];
	if(i > 0) {
		var year = item[0],
			name = item[2],
			price = item[3],
			x = item[13],
			y = item[14],
			value = item[15],
			mark = item[4];
		years[year] = year;
		items[name] = name;
		dataObj[year + name] = {
			year,
			name,
			price,
			x,
			y,
			value,
			mark
		};
		priceA = price;
	}
}
for(var year in years) {
	for(var item in items) {
		var sql = "";
		if(!(year + item in dataObj)) {
			sql = `insert into dl_brandmarket_bubblechart values (null,'${year}','${item}','${priceA}',0,0,0,'潜力规格');
			`;
		} else {
			var x = dataObj[year + item].x,
				y = dataObj[year + item].y,
				value = dataObj[year + item].value,
				mark = dataObj[year + item].mark;
			sql = `insert into dl_brandmarket_bubblechart values (null,'${year}','${item}','${priceA}','${x}','${y}','${value}','${mark}');
			`;
		}
		sqlArr.push(sql);
	}
}


//同步方法
fs.writeFileSync('./sql.sql',sqlArr.join(""));
