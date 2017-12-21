var express = require('express');
var request = require('request');
var router = express.Router();
var sqlClient = require('../db/SqlClient');

//气泡图数据
router.get('/BubbleChartData', function(req, res, next) {
	var sql1 = `select distinct item_name,mark from dl_brandmarket_bubblechart order by item_name`;
	var sql2 = `select distinct year from dl_brandmarket_bubblechart order by year`;
	var sql3 = `select year,item_name,x,y,value from dl_brandmarket_bubblechart order by year,item_name`;
	var query1 = sqlClient.queryArr(sql1);
	var query2 = sqlClient.queryArr(sql2);
	var query3 = sqlClient.queryArr(sql3);
	
	Promise.all([query1, query2, query3]).then(function(result) {
		var countries = [];
		result[0].forEach(function(item,index){
			countries.push([item.item_name,item.mark]);
		})
		
		var years = [];
		result[1].forEach(function(item,index){
			years.push(item.year);
		})
		
		var data = [];
		result[2].forEach(function(item,index){
			var index = years.indexOf(item.year);
			if(!data[index]){
				data[index] = [];
			}
			data[index].push([item.x,item.y,item.value]);
		})
		
		res.send({
			countries,years,data
		});
	}).catch(function(err) {
		console.log(err);
	})
	
});


//上升下降趋势
router.get('/getSalesVolumeTrade', function(req, res, next) {
	var sql = `select * from dl_salesvolume_trend order by id asc limit 8`;
	var query = sqlClient.queryArr(sql);
	
	var upData = [];
	var balanceData = [];
	var downData = [];
	sqlClient.queryArr(sql).then(function(data){
		for(var i=0; i<data.length; i++) {
			if(data[i].trend == '00') {
				upData.push(data[i].brand);
			}else if(data[i].trend == '01'){
				downData.push(data[i].brand);
			}else if(data[i].trend == '02') {
				balanceData.push(data[i].brand)
			}
		}
		
		res.send({
			upData,downData,balanceData
		});
	}).catch(function(err){
		console.log(err);
	})
});


//主销、护卫规格市场指标
router.get('/getSalesIndicator', function(req, res, next) {
	var sql = `select * from dl_sales_indicator order by type,id asc`;
	sqlClient.queryArr(sql).then(function(data){
		var brand = [];
		var boxData = [];
		
		data.forEach(function(item,index){
			brand.push(item.brandname);
			if(!boxData[index]){
				boxData[index] = [];
			}
			boxData[index].push([item.price, '零售价'],[item.stocktosalesratio,'存销比'],[item.status,'市场状态'],[item.orderratio,'订购面']);
		})
		
		res.send({brand,boxData});
		
	}).catch(function(err){
		console.log(err);
	})
});

//综合对比
router.get('/getTotalContrast', function(req, res, next) {
	var sql = `select * from dl_brandmarket_totalcontrast order by id asc`;
	sqlClient.queryArr(sql).then(function(data){
		//走势对比
		var target = [];
		var tobacco = [];
		//对比规格的ID数组
		var ids = [];
		data.forEach(function(item,index){
			//走势对比
			if(item.type == '00') {
				target.push(item.brandname, item.spec);
			}else if(item.type == '01') {
				tobacco.push([item.brandname, item.spec]);
				ids.push(item.id);
			}
		})
		res.send({target,tobacco,ids});
	}).catch(function(err){
		console.log(err);
	})
});



//年龄对比
router.get('/getAgeContrast', function(req, res, next) {
	var id = req.query.id;
	var sql = `select * from dl_brandmarket_totalcontrast where type= '00' or id = ${id} `;
	sqlClient.queryArr(sql).then(function(data){
		//年龄对比
		var name = [];
		var yData1 = [];
		var yData2 = [];
		
		data.forEach(function(item,index){
			name.push(item.brandname+'('+item.spec+')');
			if(index == 0) {
				yData1.push(item.value1,item.value2,item.value3,item.value4,item.value5);
			}else if(index == 1) {
				yData2.push(item.value1,item.value2,item.value3,item.value4,item.value5);
			}
		})
		res.send({name,yData1,yData2});
	}).catch(function(err){
		console.log(err);
	})
});

//价格对比
router.get('/getPriceContrast', function(req, res, next) {
	var id = req.query.id;
	var sql = `select * from dl_brandmarket_totalcontrast where type= '00' or id = ${id} `;
	sqlClient.queryArr(sql).then(function(data){
		var retdata = [];
		data.forEach(function(item,index){
			retdata.push([item.price.toString(), item.brandname+'('+item.spec+')'])
		})
		res.send(retdata);
	}).catch(function(err){
		console.log(err);
	})
});


//走势对比
router.get('/getBehaviourContrast', function(req, res, next) {
	var id = req.query.id;
	var sql = `select t.*,e.* from dl_brandmarket_totalcontrast t 
			right join dl_brandmarket_contrastextend e on t.id = e.brandid
			where t.type= '00' or t.id = ${id} order by e.id `;
	sqlClient.queryArr(sql).then(function(data){
		var name = [];
		var xData = [];
		var yData1 = [];
		var yData2 = [];
		var tmpbrandid = '';
		
		data.forEach(function(item,index){
			if(item.brandid != tmpbrandid) {
				tmpbrandid = item.brandid;
				name.push(item.brandname+'('+item.spec+')');
			}
			
			if(item.type == '00') {
				xData.push(item.month);
				yData1.push(item.value);
			}else if(item.brandid == id) {
				yData2.push(item.value);
			}
		})
		res.send({name,xData,yData1,yData2});
	}).catch(function(err){
		console.log(err);
	})
});


//存销对比
router.get('/getStockSaleContrast', function(req, res, next) {
	var id = req.query.id;
	var sql = `select * from dl_brandmarket_totalcontrast where type= '00' or id = ${id} `;
	sqlClient.queryArr(sql).then(function(data){
		var barData1 = [];
		var barData2 = [];
		var barData3 = [];
		var barData4 = [];
		var barData5 = [];
		data.forEach(function(item,index){
			barData1.push(item.stock);
			barData2.push(item.maxstock);
			barData3.push(item.salesvolume);
			barData4.push(item.maxsalesvolume);
			barData5.push(item.brandname+'('+item.spec+')');
		})
		res.send({barData1,barData2,barData3,barData4,barData5});
	}).catch(function(err){
		console.log(err);
	})
});


//性别对比
router.get('/getGenderContrast', function(req, res, next) {
	var id = req.query.id;
	var sql = `select * from dl_brandmarket_totalcontrast where type= '00' or id = ${id} `;
	sqlClient.queryArr(sql).then(function(data){
		var retdata = [];
		data.forEach(function(item,index){
			retdata.push(
				{
					text:item.brandname+'('+item.spec+')',
					data:[{name:'男性',value:item.maleratio},{name:'女性',value:item.femaleratio}]
				}
			);
		})
		res.send(retdata);
	}).catch(function(err){
		console.log(err);
	})
});

module.exports = router;
