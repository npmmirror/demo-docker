var express = require('express');
var router = express.Router();
var sqlClient = require('../../db/SqlClient');

/* GET home page. */
router.get('/getLastOneMonthSale', function(req, res, next) {

    let shopId = req.query.shopId;
    let sql = `SELECT * FROM IRT_SHOP_SALE_TIME WHERE SHOP_ID = ${shopId}`
    sqlClient.queryArr(sql).then((data) => {
        let result = [];
        for(let i = 0; i < data.length; i++){

            result.push([data[i].SALE_HOUR,data[i].SALE_NUM]);
        }
        res.send(result);
    });

});
//获取店铺详情
router.get('/getShopMessage', function(req, res, next) {
	let shopId = req.query.shopId;
    let sql = `SELECT INFO1 shopName, INFO2 format, INFO3 city, CONCAT(INFO4,' 档') stalls, INFO5 businessArea,
    INFO6 businessDistrict, SHOW_OWNER_NAME ownerName, SLSMAN_NAME accountManager, SLSMAN_PHONE tel
    FROM IRT_SHOP_INFO WHERE SHOP_ID = ${shopId}`
    sqlClient.queryOne(sql).then((data) => {
        res.send(data||{});
    });

});
//获取店铺销售详情
router.get('/getSaleMessage', function(req, res, next) {

    let shopId = req.query.shopId;
    let sql = `SELECT FORMAT(DATA1,2) DATA1,FORMAT(DATA2,0) DATA2,FORMAT(DATA3,2) DATA3,FORMAT(DATA4,2) DATA4,
    FORMAT(DATA5*100,2) DATA5,FORMAT(DATA6*100,2) DATA6,SHOP_HEADPIC FROM IRT_SHOP_INFO WHERE SHOP_ID = ${shopId}`
    sqlClient.queryOne(sql).then((data) => {
        res.send(data||{});
    });
});

//获取各个指标
router.get('/getQuota', function(req, res, next) {
	let shopId = req.query.shopId;

    let sql = `SELECT FORMAT(DATA7,2) grossProfit,CONCAT(FORMAT(DATA8*100,2),'%') grossRate,FORMAT(DATA9,2) salesRate FROM IRT_SHOP_INFO WHERE SHOP_ID = ${shopId}`
    sqlClient.queryOne(sql).then((data) => {
        res.send(data||{});
    });

});

//获取卷烟列表
router.get('/getTobaccoList', function(req, res, next) {
	let shopId = req.query.shopId;

    let sql = `SELECT * FROM IRT_SHOP_SALE_GOODS WHERE SHOP_ID = ${shopId}`
    sqlClient.queryArr(sql).then((data) => {
        res.send(data||[]);
    });

});

//获取条盒比和结算
router.get('/getBarBoxAndStatement', function(req, res, next) {
	let shopId = req.query.shopId;
		sql = `SELECT  MNY_CASH, MNY_CODE FROM IRT_SETTLEMENT 
				WHERE  SHOP_ID='${shopId}' `;
		let data1 = sqlClient.queryOne(sql);

		sql = ` SELECT SUM(BIG_SALE_AMT) BIG_SALE_AMT, SUM(SMALL_SALE_AMT) SMALL_SALE_AMT
				FROM IRT_BARRELS_RATIO
				WHERE SHOP_ID='${shopId}'
				`;
		let data2 = sqlClient.queryOne(sql);
		
    Promise.all([data1, data2]).then(function(data){
    
    	let proportion = 0;
    	if(data[0].MNY_CASH != 0 || data[0].MNY_CODE != 0){
    		proportion = parseFloat(data[0].MNY_CASH/(data[0].MNY_CASH+data[0].MNY_CODE)*100).toFixed(0);
    	}
		
		//结算
		let statementData =[
			{name:proportion+'%',value:data[0].MNY_CASH, selected:true,desc:'现金'},
			{name:(100-proportion).toFixed(0)+'%',value:data[0].MNY_CODE,desc:'扫码'}
		];
		//条盒比
		let prop = 0;
		if(data[1].BIG_SALE_AMT != 0 || data[1].SMALL_SALE_AMT != 0){
			prop = parseFloat(data[1].BIG_SALE_AMT/(data[1].BIG_SALE_AMT+data[1].SMALL_SALE_AMT)*100).toFixed(0);
		}
		
		let barBoxData =[
			{name:prop+'%',value:data[1].SMALL_SALE_AMT, selected:true,desc:'盒'},
			{name:(100-prop).toFixed(0)+'%',value:data[1].BIG_SALE_AMT,desc:'条'}
		];
		 let data0 = {
	    	barBoxData: barBoxData,
	    	statementData:statementData
    		}
    	res.send(data0);
    })
   
});

//获取分类统计
router.get('/getClassify', function(req, res, next) {
	let shopId = req.query.shopId;
	sql = `SELECT  E.KIND, SUM(D.SALE_AMT) SALE_MNY
			FROM RDC_CUST_GOODS_DAY D, PUB_GOODSINFO_EXT E
			WHERE D.BARCODE=E.BARCODE
			 AND SHOP_ID='${shopId}'
			 AND IS_TOBACCO='01'
			GROUP BY E.KIND`;
	console.log(sql);		
	sqlClient.queryArr(sql).then(function(data){
		let arr =[10,20,30,40,50];
		let result = [];
		let temp = [];
		for(let i=0;i<data.length;i++){
			temp[data[i].KIND] = data[i].SALE_MNY;
		}
		for(let i=0;i<arr.length;i++){
			result.push(temp[arr[i]] || 0);
		}
		res.send(result.reverse());
	});
});

module.exports = router;