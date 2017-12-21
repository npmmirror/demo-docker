var express = require('express');
var request = require('request');
var router = express.Router();
var sqlClient = require('../db/SqlClient');

//今日实时数据
router.get('/getTotalNumber', function(req, res, next) {
	var sql = `select * from dl_realtime_measure`;
	sqlClient.queryArr(sql).then(function(data){
		res.send(data);
	})
});

//月度交易情況
router.get('/getMonthlyTransaction', function(req, res, next) {
	var sql = `select * from dl_realtime_monthlytransaction order by id`;
	sqlClient.queryArr(sql).then(function(data){
		var obj = {};
		var xData = [];
		var barData = [];
		var lineData = [];
		for(var i=0; i<data.length; i++) {
			var tmpdata = data[i];
			xData.push(tmpdata.month);
			barData.push(tmpdata.amount);
			lineData.push(tmpdata.count);
		}
		obj.xData = xData;
		obj.barData = barData;
		obj.lineData = lineData;
		res.send(obj);
	})
});

//实时交易波动
//数据库时间经过处理，返回的是当前日期
router.get('/getFluctuations', function(req, res, next){
	var time = req.query.time;
	var count = req.query.count;	
	var sql = '';
	if(count == 1) {
		var timetmp = time.substring(8);
		sql = `select date_format(concat(date_format(now(),'%Y%c%d') , right(time,6)), '%Y-%m-%d %H:%i:%s') as time,count from dl_realtime_tradefluctuations_r where right(time,6) = ${timetmp} limit 1`;
		sqlClient.queryArr(sql).then(function(data){
			var arr = new Array();
			arr[0] = data[0].time;
			arr[1] = data[0].count;
			var map = {
				value:arr
			};
			res.send(map);
		})
	}else {
		var timetmp = time.substring(8);
		sql = `select * from (select date_format(concat(date_format(now(),'%Y%c%d') , right(time,6)), '%Y-%m-%d %H:%i:%s') as time,count from dl_realtime_tradefluctuations_r where right(time,6) <= ${timetmp} order by time desc limit ${count}) tmp order by tmp.time asc`;
		sqlClient.queryArr(sql).then(function(data){
			var obj = new Array();
			for(var i=0; i<data.length; i++) {
				var arr = new Array();
				arr[0] = data[i].time;
				arr[1] = data[i].count;
				
				var map = {
					value:arr
				};
				obj.push(map);
			}
			res.send(obj);
		})
	}
});

//创建实时销售额虚拟数据
//http://localhost:3001/server/realtime/setRealtimeSaleamount
router.get('/setRealtimeSaleamount', function(req, res, next){
	var daytime = 86400000;
	var starttime = +new Date('2017-09-21 00:00:00');
	var i= 0;
	console.log("starttime="+starttime);
	
	var insertData = function(){
		if(i == daytime){
			return ;
		}
		var tmptime = new Date(starttime + i*1000);
		console.log("tmptime="+tmptime);
		var time = tmptime.getFullYear() 
		+ ((tmptime.getMonth()+1)<10 ?("0" + (tmptime.getMonth()+1)):(tmptime.getMonth()+1))
		+ (tmptime.getDate() <10 ?("0" + tmptime.getDate()):tmptime.getDate())
		+ (tmptime.getHours() <10 ?("0" + tmptime.getHours()):tmptime.getHours())
		+ (tmptime.getMinutes() <10 ?("0" + tmptime.getMinutes()):tmptime.getMinutes())
		+ (tmptime.getSeconds() <10 ?("0" + tmptime.getSeconds()):tmptime.getSeconds());
		var amount = 487632598.03 +  parseInt(Math.random()*100);
		var id = i+1;
		sql = `insert into dl_realtime_saleamount values(${id},${time},${amount})`;	
		console.log("sql="+sql);
		i++;
		sqlClient.insert(sql).then(function(){
			insertData();
		});
	}
	insertData();
	res.send("start insert");
});

// 获取实时销售额数据
router.get('/getRealtimeSaleamount', function(req, res, next){
	var time = req.query.time.substring(8);
	var count = req.query.count;
	sql = `select date_format(time, '%Y-%m-%d %H:%i:%s') as time,amount from dl_realtime_saleamount_r where right(time,6) = ${time} limit ${count}`;
	sqlClient.queryArr(sql).then(function(data){
		if(data != '') {
			var arr = new Array();
			for(var i=0; i<data.length; i++) {
				var tmpdata = data[i];
				var obj = new Object();
				obj.time=tmpdata.time;
				obj.amount=tmpdata.amount;
				arr.push(obj);
			}
			res.send(arr);
		}else {
			res.send('null');
		}
	});
});


//获取交易数据
router.get('/getRealtimeTradeData', function(req, res, next){
	var time = req.query.time;
	var sql = `select
				date_format(o.time, '%Y-%m-%d %H:%i:%s') as tradetime, o.amoney as tradeamount,o.details as tradedetails,o.orderid,
				s.shopname, s.totalamount, s.totalcount, s.brandcount, s.custamount,s.averageprice,s.totalamount1,s.totalcount1,s.totalamount2,s.totalcount2,s.totalamount3,s.totalcount3,s.longitude,s.latitude,
				c.age as custage,c.gender as custgender, c.isvip, c.tags, c.brandname1, c.brandscale1, c.brandname2, c.brandscale2, c.brandname3, c.brandscale3
				from  o, dl_realtime_shopmsg_r s, dl_realtime_custmsg_r c
				where o.time >= ${time}
				and o.shopid = s.shopid
				and o.custid = c.custid
				order by o.time asc
				limit 1`;
	var orderid = '';

	sqlClient.queryArr(sql).then(function(data){
		var retdata = data[0];
		orderid = retdata.orderid;
		var orderdetailsql = `select goodsname, amount from dl_realtime_orderdetail_r where orderid = '${orderid}' limit 2`;
		var orderDetail = new Array();
		sqlClient.queryArr(orderdetailsql).then(function(orderdata){
			for(var i=0; i<orderdata.length; i++) {
				var orderdatatmp = orderdata[i];
				var order = new Array();
				order.push(orderdatatmp.goodsname);
				order.push(orderdatatmp.amount);
				orderDetail.push(order);
			}
			
			retdata.orderDetail = orderDetail;
			res.send(retdata);
		});
	});
	

});


//获取时间段区间内的交易数据
router.get('/getIntervalRealtimeTradeData', function(req, res, next){
		var starttime = req.query.starttime.substring(8);
		var endtime = req.query.endtime.substring(8);
		var sql = `select
				date_format(o.time, '%Y-%m-%d %H:%i:%s') as tradetime, o.amoney as tradeamount,o.details as tradedetails,o.orderid,
				s.shopname, s.totalamount, s.totalcount, s.brandcount, s.custamount,s.averageprice,s.totalamount1,s.totalcount1,s.totalamount2,s.totalcount2,s.totalamount3,s.totalcount3,s.longitude,s.latitude,
				c.age as custage,c.gender as custgender, c.isvip, c.tags, c.brandname1, c.brandscale1, c.brandname2, c.brandscale2, c.brandname3, c.brandscale3
				from dl_realtime_ordermsg_r o, dl_realtime_shopmsg_r s, dl_realtime_custmsg_r c
				where right(o.time,6) between ${starttime} and ${endtime} 
				and o.shopid = s.shopid
				and o.custid = c.custid
				order by o.time asc`;
		
		var orderid = '';
		sqlClient.queryArr(sql).then(function(data){
			if(data.length > 0) {
				//最后一条需要展示店铺和用户数据，其他不进行查询
				orderid = data[data.length-1].orderid;
				var orderdetailsql = `select goodsname, amount from dl_realtime_orderdetail_r where orderid = '${orderid}' limit 2`;
				var orderDetail = new Array();
				sqlClient.queryArr(orderdetailsql).then(function(orderdata){
					for(var i=0; i<orderdata.length; i++) {
						var orderdatatmp = orderdata[i];
						var order = new Array();
						order.push(orderdatatmp.goodsname);
						order.push(orderdatatmp.amount);
						orderDetail.push(order);
					}
					data[data.length-1].orderDetail = orderDetail;
					res.send(data);
				});
			}else {
				res.send('null');
			}
		});
});


module.exports = router;
