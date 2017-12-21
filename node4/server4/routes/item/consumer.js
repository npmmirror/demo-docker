var express = require('express');
var router = express.Router();
var sqlClient = require('../../db/SqlClient');

//购买时间分布
router.get('/getSaleTimeDis', function(req, res, next) {
	let barCode = req.query.barCode;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT HOUR00, HOUR01, HOUR02, HOUR03, HOUR04, HOUR05, HOUR06,
			HOUR07,HOUR08,HOUR09,HOUR10,HOUR11,HOUR12,HOUR13,HOUR14,
			HOUR15,HOUR16,HOUR17,HOUR18,HOUR19,HOUR20,HOUR21,HOUR22,HOUR23
		FROM RDC_GOODS_CONSUMER_MONTH
		WHERE ORG_CODE = ${orgCode}
		AND BARCODE = ${barCode}
		AND SALES_MONTH = ${saleMonth}
	`;
	sqlClient.queryOne(sql).then((data) => {
        var result = [];
        var count = 0;
        for(var key in data){
			result.push([count,data[key]]);
			count++;
		}
        res.send(result);
    });
});
//获取条盒比
router.get('/getBarBox', function(req, res, next) {
	let barCode = req.query.barCode;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT BIG_SALE_AMT, SMALL_SALE_AMT
		FROM RDC_GOODS_CONSUMER_MONTH
		WHERE ORG_CODE = ${orgCode}
		AND BARCODE = ${barCode}
  		AND SALES_MONTH = ${saleMonth}
	`;
	sqlClient.queryOne(sql).then((data) => {
        var result = [];
        result.push({
        	name:'条',
        	value:data.BIG_SALE_AMT,
        	selected:true
        });
        result.push({
        	name:'盒',
        	value:data.SMALL_SALE_AMT
        });
        res.send(result);
    });
});
//活跃消费者
router.get('/getMapData',function(req, res, next){
	let barcode = req.query.barcode;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT SHOP.ORIGINAL_LONGITUDE, SHOP.ORIGINAL_LATITUDE,
		SHOP.SHOP_ID
		FROM RDC_CUST_GOODS_MONTH SALE, CA_SHOP_INFO_EXT SHOP
		WHERE SALE.ORG_CODE = SHOP.ORG_CODE
		
		AND SALE.SHOP_ID = SHOP.SHOP_ID
		AND SALE.ORG_CODE = ${orgCode}
		AND SALE.SALES_MONTH = ${saleMonth}
		AND SALE.BARCODE = ${barcode}
	`;//AND SALE.TENANT_ID = SHOP.TENANT_ID
	sqlClient.queryArr(sql).then((data) => {
        var result = [];
        for(var i=0;i<data.length;i++){
        	result.push({
        		name:data[i].SHOP_ID,
        		value:[
        			data[i].ORIGINAL_LONGITUDE,
        			data[i].ORIGINAL_LATITUDE,
        			1
        		]
        	});
        }
        res.send(result);
    });
});
//获取消费者排行
router.get('/getConsumerRank', function(req, res, next) {
	let barCode = req.query.barCode;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT CS_PEOPLE.PEOPLE_ID,SALE_AMT,SALE_NUM, CS_PEOPLE.GENDER, CS_PEOPLE.AGE
		FROM RDC_GODS_PEOPLE_MONTH,CS_PEOPLE
		WHERE RDC_GODS_PEOPLE_MONTH.ORG_CODE = CS_PEOPLE.ORG_CODE
		AND RDC_GODS_PEOPLE_MONTH.PEOPLE_ID = CS_PEOPLE.PEOPLE_ID
		AND RDC_GODS_PEOPLE_MONTH.ORG_CODE= ${orgCode}
		AND RDC_GODS_PEOPLE_MONTH.BARCODE = ${barCode}
		AND RDC_GODS_PEOPLE_MONTH.SALES_MONTH = ${saleMonth}
		ORDER BY SALE_AMT DESC
		LIMIT 50
	`;
	sqlClient.queryArr(sql).then((data) => {
        res.send(data);
    });
});
//获取卷烟销售情况
router.get('/getTobaccoSales', function(req, res, next) {
    let targetId = req.query.targetId;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT TARGET_GODS_ID,GODS_NAME,RELATED_GODS_ID, TARGET_AMT, RELATED_AMT, RELATED_PRICE
		FROM RDC_GOODS_RELATED_MONTH
		WHERE ORG_CODE= ${orgCode}
		AND TARGET_GODS_ID = ${targetId}
		AND SALES_MONTH = ${saleMonth}
		AND IS_TOBACCCO = '1'
		ORDER BY RELATED_AMT DESC
		LIMIT 20
	`;
	sqlClient.queryArr(sql).then((data) => {
        res.send(data);
    });
});

//获取非烟销售情况
router.get('/getNoTobaccoSales', function(req, res, next) {
	let targetId = req.query.targetId;
	let saleMonth = req.query.saleMonth;
	let orgCode = req.query.orgCode;
	let sql = `
		SELECT TARGET_GODS_ID,GODS_NAME,RELATED_GODS_ID, TARGET_AMT, RELATED_AMT, RELATED_PRICE
		FROM RDC_GOODS_RELATED_MONTH
		WHERE ORG_CODE= ${orgCode}
		AND TARGET_GODS_ID = ${targetId}
		AND SALES_MONTH = ${saleMonth}
		AND IS_TOBACCCO = '0'
		ORDER BY RELATED_AMT DESC
		LIMIT 20
	`;
	sqlClient.queryArr(sql).then((data) => {
        res.send(data);
    });
});

module.exports = router;