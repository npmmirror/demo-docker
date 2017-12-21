var express = require('express');
var request = require('request');
var router = express.Router();
var sqlClient = require('../db/SqlClient');

/**
 * 消费者分布与消费者行为分析模块
 */

//卷烟类热销商品接口
router.get('/popularTobacco', function(req, res, next){
	var sql =  `select * from  dl_popular_tobacco order by rangeid asc, id asc`;
	sqlClient.queryArr(sql).then(function(data){
		var chartDataList = [];
		var ydata = [];
		var value1 = [];
		var value2 = [];
		for(var i=0; i<data.length; i++) {
			var tmpdata = data[i];
			
			ydata.push(tmpdata.brandname);
			value1.push(tmpdata.amount);
			value2.push(tmpdata.refvalue);
			if((i+1)%5 == 0) {
				var obj = {
					ydata:ydata,
					value1:value1,
					value2:value2
				};					
				chartDataList.push(obj);
				ydata = [];
				value1 = [];
				value2 = [];
			}
		}
		res.send(chartDataList);
	})
});

//非烟类热销商品排行
router.get('/popularNoTobacco', function(req, res, next){
	var sql = `select * from dl_popular_notobacco order by id asc, sortid asc`;
	sqlClient.queryArr(sql).then(function(data){
		var lineDataList = [];
		var arr = [];
		for(var i=0; i<data.length; i++) {
			var tmpdata = data[i];
			arr.push(tmpdata.goodsname);
			if((i+1)%10 == 0) {
				lineDataList.push(arr);
				arr = [];
			}
		}
		res.send(lineDataList);
	})
});

//获取消费者分析头部数据
router.get('/getAnalyzeData',function(req, res, next){
	sql = `select * from dl_cust_analyze order by custsortid`;
	sqlClient.queryArr(sql).then(function(data){
		//全部类别的面板展示数据
		var panelData = [];
		//顶部TAB页面所需展示的数据
		var rightBoxTopArr = [];
		for(var i=0; i<data.length; i++) {
			var dataTmp = data[i];
			//处理顶部tab页面展示所需数据
			var rightBoxTopIndexObj = {
				name:dataTmp.custsortname,
				value:dataTmp.custsortratio
			};
			rightBoxTopArr.push(rightBoxTopIndexObj);
			//处理面板展示所需数据
			var panelObj = {
				maxactivityjoinratio:dataTmp.maxactivityjoinratio,
				avgactivityjoinratio:dataTmp.avgactivityjoinratio,
				maxexpense:dataTmp.maxexpense,
				avgexpense:dataTmp.avgexpense,
				custsortid:dataTmp.custsortid
			};
			panelData.push(panelObj);
		}
		var obj = {
			rightBoxTop:rightBoxTopArr,
			panelData:panelData
		};
		res.send(obj);
	})
});


//获取消费者购买喜好数据
router.get('/getBrandBuyRatio',function(req, res, next){
	var custsortid = req.query.custsortid;
	var sql = `select brandname,maxratio,buyratio from dl_brand_buyratio where custsortid = ${custsortid}`;
	var indicator = [];
	var value = [];
	var text = '喜欢买';
	sqlClient.queryArr(sql).then(function(data){
		for(var i=0; i<data.length; i++) {
			var tmpdata = data[i];
			if(i==0){
				text = text + data[0].brandname;
			}
			var indicatorobj = {
				name:tmpdata.brandname,
				max:tmpdata.maxratio
			}
			indicator.push(indicatorobj);
			value.push(tmpdata.buyratio);
		}
		
		var retobj = {
			'text':text,
			'indicator':indicator,
	        'data':[
	        	{
	                value : value,
	                name : '品牌喜好'
	            }
	        ]
		}
		res.send(retobj);
	})
});

//获取消费者年龄性别比例分布数据
router.get('/getGenderAgeRatio',function(req, res, next){
	var custsortid = req.query.custsortid;
	var sql = `select agerange,maleratio,femaleratio,description from dl_custgenderage_ratio where custsortid = ${custsortid}`;
	sqlClient.queryArr(sql).then(function(data){
		var yData1 = [];
		var yData2 = [];
		var t;
		for(var i=0; i<data.length; i++) {
			yData1.push(data[i].maleratio);
			yData2.push(data[i].femaleratio);
			t=data[i].description;
		}
		
		var retobj = {
			text:t,
			yData1:yData1,
			yData2:yData2
		}
		res.send(retobj);
	})
});



//获取不同消费群体普通烟与细支烟趋势比较数据
router.get('/getCigaretteCompareData',function(req, res, next){
	var custsortid = req.query.custsortid;
	var sql = `select * from dl_behavioranalysis_cigaretteextend where custsortid = ${custsortid} order by cigarettetype asc ,month asc`;
	sqlClient.queryArr(sql).then(function(data){
		var yData1 = [];
		var yData2 = [];
		
		data.forEach(function(item,index){
			if(item.cigarettetype == '00') {
				yData1.push(item.value);
			}else if(item.cigarettetype == '01') {
				yData2.push(item.value);
			}
		})
		
		res.send({yData1,yData2});
	})
});

module.exports = router;