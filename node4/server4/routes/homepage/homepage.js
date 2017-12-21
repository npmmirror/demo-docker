var express = require('express');
var router = express.Router();
//var request = require('request');
var sqlClient = require('../../db/SqlClient');

/* GET home page. */
//实时交易总额
router.get('/getRealTimeSaleMoney', function(req, res, next) {
	res.send("error");
});
router.get('/getRealTimeSaleMoney1', function(req, res, next) {
    let time = req.query.time || (new Date).getTime();
    let count = req.query.count || 1;

    time = new Date(parseInt(time));
    count = parseInt(count);

    let startTime = time.format('hhmmss');

    let sql = `SELECT * FROM IRT_REALTIME_SALE 
     			where AREA = '大连' AND CREA_TIME >= ${startTime}
  				ORDER BY CREA_TIME LIMIT 0,${count}`;

    let result = [];
    sqlClient.queryArr(sql).then((data) => {

        for(let i = 0, creaTime; i < data.length; i++){
            creaTime = data[i].CREA_TIME;

            creaTime = new Date(time.setHours(Number(creaTime.substr(0,2)),Number(creaTime.substr(2,2)),Number(creaTime.substr(4,2)),0));

            result.push({
                name: creaTime,
                value: [creaTime, data[i].SALE_MNY]
            })
        }
        res.send(result);
    });

});
//卷烟实时交易额
router.get('/getRealTimeCigaretteSaleMoney',function(req,res,next){
	let time = req.query.time || (new Date).getTime();
    let count = req.query.count || 1;

    time = new Date(parseInt(time));
    count = parseInt(count);

    let startTime = time.format('hhmmss');

    let sql = `SELECT * FROM IRT_REALTIME_SALE 
     			where AREA = '大连' AND CREA_TIME >= ${startTime}
  				ORDER BY CREA_TIME LIMIT 0,${count}`;

    let result = [];
    sqlClient.queryArr(sql).then((data) => {

        for(let i = 0, creaTime; i < data.length; i++){
            creaTime = data[i].CREA_TIME;

            creaTime = new Date(time.setHours(Number(creaTime.substr(0,2)),Number(creaTime.substr(2,2)),Number(creaTime.substr(4,2)),0));

            result.push({
                // name: creaTime,
                value: [creaTime, data[i].SALE_MNY_TOBACCO]
            })
        }
        res.send(result);
    });

});
//实时交易人数
router.get('/getTradeNum',function(req,res,next){
	let time = req.query.time || (new Date).getTime();
    let count = req.query.count || 1;

    time = new Date(parseInt(time));
    count = parseInt(count);

    let startTime = time.format('hhmmss');

    let sql = `SELECT * FROM IRT_REALTIME_SALE 
     			where AREA = '大连' AND CREA_TIME >= ${startTime}
  				ORDER BY CREA_TIME LIMIT 0,${count}`;

    let result = [];
    sqlClient.queryArr(sql).then((data) => {

        for(let i = 0, creaTime; i < data.length; i++){
            creaTime = data[i].CREA_TIME;

            creaTime = new Date(time.setHours(Number(creaTime.substr(0,2)),Number(creaTime.substr(2,2)),Number(creaTime.substr(4,2)),0));

            result.push({
                name: creaTime,
                value: [creaTime, data[i].SALE_PERSONS]
            })
        }
        res.send(result);
    });

});
/* GET home page. */

//热销榜
router.get('/getGoodsMess', function(req, res, next) {
	
    let classIndex = req.query.classIndex;//分类
    let dateIndex = req.query.dateIndex;//日期
    let currentArea = req.query.currentArea;//区域：全国，北京，大连
    
    if(currentArea =='dalian'){
		currentArea = '大连';
	}
	if(currentArea =='beijing'){
		currentArea = '北京';
	}
	if(currentArea =='all'){
		currentArea = '全国';
	}
	
    sql = `SELECT GODS_NAME, BAR_CODE,IMG_PATH FROM IRT_GOODSHOT_SALE 
    WHERE AREA = '${currentArea}' AND PERIOD = '${dateIndex}' AND TYPE = '${classIndex}' ORDER BY ID LIMIT 7`;

    sqlClient.queryArr(sql).then(function(data){
    	res.send(data);
    });
   
});
//获取图片路径
router.get('/getImgPath',function(req,res,next){
	
	let pathId = req.query.id;
	var options = {
	    root: './img/'
	};
	pathId = pathId + '.jpg';
	res.sendFile(pathId,options);
})

//首页-指标
//月累计交易额、交易笔数、消费者人数
router.get('/getTopThreeIndex', function(req, res, next) {
	
	let currentArea = req.query.currentArea;
	//let first = req.query.first;
	let currentTime = req.query.time;//当前时间
	
	console.log(currentTime);
	if(currentArea =='dalian'){
		currentArea = '大连';
	}
	if(currentArea =='beijing'){
		currentArea = '北京';
	}
	//如果地域为全国 ，求各指标之和
	if(currentArea == 'all'){
		sql1 = `SELECT SUM(SALE_MNY) SALE_MNY,SUM(SALE_NUM) SALE_NUM,SUM(CONSUMER_NUM) CONSUMER_NUM 
			FROM IRT_ACCUMULATIVE_SALE`;
		sql2 =`SELECT SUM(SALE_MNY) SALE_MNY,SUM(SALE_PERSONS) SALE_PERSONS, SUM(SALE_AMT) SALE_AMT FROM IRT_REALTIME_SALE WHERE CREA_TIME <='${currentTime}'`;
	}else{
		sql1 = `SELECT SALE_MNY,SALE_NUM,CONSUMER_NUM 
			FROM IRT_ACCUMULATIVE_SALE WHERE AREA='${currentArea}'`;
		sql2 =`SELECT SUM(SALE_MNY) SALE_MNY,SUM(SALE_PERSONS) SALE_PERSONS, SUM(SALE_AMT) SALE_AMT FROM IRT_REALTIME_SALE WHERE CREA_TIME <= '${currentTime}' AND AREA='${currentArea}'`;
	}
	
	let data1 = sqlClient.queryOne(sql1);
	let data2 = sqlClient.queryOne(sql2);
	
	Promise.all([data1, data2]).then(function(data) {
		data[0].SALE_MNY = data[0].SALE_MNY + data[1].SALE_MNY;
		data[0].SALE_AMT = data[0].SALE_NUM + data[1].SALE_AMT;
		data[0].CONSUMER_NUM = data[0].CONSUMER_NUM + data[1].SALE_PERSONS;
		res.send(data[0]);
	});
	
});
//客单价、经营商品数、商户数
router.get('/getLastTwoIndex', function(req, res, next) {
	let currentArea = req.query.currentArea;
	if(currentArea =='dalian'){
		currentArea = '大连';
	}
	if(currentArea =='beijing'){
		currentArea = '北京';
	}
	if(currentArea=='all'){
		sql = `SELECT SUM(GOODS_NUM) GOODS_NUM, SUM(CUSTOMER_PRICE) CUSTOMER_PRICE, SUM(BUSINESS_NUM) BUSINESS_NUM 
			FROM IRT_ACCUMULATIVE_SALE`
	}else{
		sql = `SELECT GOODS_NUM ,  CUSTOMER_PRICE , BUSINESS_NUM 
			FROM IRT_ACCUMULATIVE_SALE WHERE AREA='${currentArea}'`;
	}
	
	sqlClient.queryOne(sql).then(function(data){
   		 res.send(data);
   	})
	/*let data = {
		GOODS_NUM:Math.random()*10000,
		CUSTOMER_PRICE:Math.random()*10000,
		BUSINESS_NUM:Math.random()*10000
      	}
	res.send(data);*/
});
//中点，实时销售金额
router.get('/getSaleMoney', function(req,res,next) {
	let currentArea = req.query.currentArea;
	let currentTime = req.query.time;
	if(currentArea =='dalian'){
		currentArea = '大连';
	}
	if(currentArea =='beijing'){
		currentArea = '北京';
	}
	if(currentArea == 'all'){
		sql = `SELECT SUM(SALE_MNY) SALE_MNY FROM IRT_REALTIME_SALE WHERE CREA_TIME <='${currentTime}'`;
	}else{
		sql = `SELECT SUM(SALE_MNY) SALE_MNY FROM IRT_REALTIME_SALE WHERE CREA_TIME <='${currentTime}' AND AREA = '${currentArea}'`;
	}
	console.log(sql);
	sqlClient.queryOne(sql).then(function(data){
		res.send(data);
	});
	/*let data = Math.random()*100000000+'';
	res.send(data);*/
});

//商户分布以及交易点
router.get('/getShopInfos', function(req, res, next) {
	let timeNow = req.query.timeNow;
	
	let data;
	if(timeNow){
		sql = `
			SELECT SHOP_NAME,SHOP_GEO,SALE_MNY,SALE_ITEM,ITEM_IMAGE,AREA,CREA_TIME
			FROM IRT_REALTIME_SALE_DETAIL
			ORDER BY CREA_TIME DESC
		`;
		sqlClient.queryArr(sql).then(function(data){
			res.send(data);
		});
	}else{
		sql = `SELECT SHOP_ID,SHOP_GEO,SHOP_HEADPIC,INFO1 AS SHOP_NAME,SHOW_OWNER_NAME FROM IRT_SHOP_INFO`;
		sqlClient.queryArr(sql).then(function(data){
			res.send(data);
		});
	}
    

});

router.get('/initMapData',function(req, res, next){
	var data1 = [
		{name: '云南'},
		{name: '四川'},
		{name: '山东'},
		{name: '黑龙江'},
	];
	var data2 = [
		{name: '陕西'},
		{name: '贵州'},
		{name: '江西'},
	];
	var data3 = [
		{name: '辽宁'},
		{name: '大连'},
		{name: '北京'},
	];
	var data4 = [
		/*{"name":"云南1","value":[100,23,1]},
		{"name":"云南2","value":[73.40,39,1]},
    	{"name":"云南3","value":[135.02,48,1]},
    	{"name":"云南4","value":[110,18.5,1]},
    	{"name":"云南5","value":[123.02,53,1]},*/
	]
	var data = {
		data1:data1,
		data2:data2,
		data3:data3,
		data4:data4
	}
	res.send(data);
});
//实时订单
router.get('/getOrderData',function(req, res, next){
	let nowTime = req.query.nowTime;
	console.log("nowTime=="+nowTime);
	var sql = `
		SELECT SHOP_NAME,SHOP_GEO,SALE_MNY,SALE_ITEM,ITEM_IMAGE,AREA,CREA_TIME
		FROM IRT_REALTIME_SALE_DETAIL
		WHERE CREA_TIME <= ${nowTime}
		ORDER BY CREA_TIME DESC
		LIMIT 1
	`;
	console.log("sql="+sql);
	sqlClient.queryOne(sql).then(function(data){
		data.SALE_TIME = new Date().getFullYear() + "-" +new Date().format("MM-dd hh:mm:ss");
		console.log(data);
		res.send(data);
	});
});
//所有实时订单
router.get('/getAllOrderData',function(req, res, next){
	var sql = `
		SELECT SHOP_NAME,SHOP_GEO,SALE_MNY,SALE_ITEM,ITEM_IMAGE,AREA,CREA_TIME
		FROM IRT_REALTIME_SALE_DETAIL
		ORDER BY CREA_TIME DESC
	`;
	console.log("sql="+sql);
	sqlClient.queryArr(sql).then(function(data){
		console.log(data);
		res.send(data);
	});
});

module.exports = router;