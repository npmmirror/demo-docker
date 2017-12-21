var express = require('express');
var router = express.Router();
var sqlClient = require('../../db/SqlClient');

//气泡图
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
//毛利
router.get('/getGrossProfit', function(req, res, next) {
    var barData1 = [];
    var barData2 = [];
    var lineData = [];

    let orgCode = req.query.orgCode || '';

    if(orgCode)
        orgCode = `AND ORG_CODE = ${orgCode}`;

    let sql = `SELECT SALES_MONTH, SUM(GROSS_PROFIT)/SUM(SALE_MNY) GROSS_PROFIT_RATE
                  , SUM(GROSS_PROFIT_T)/SUM(GROSS_PROFIT) GROSS_PROFIT_T_RATE
                FROM RDC_MALL_MONTH
                WHERE SALES_MONTH BETWEEN '201705' AND '201711'
                ${orgCode}
                GROUP BY SALES_MONTH`

    sqlClient.queryArr(sql).then((data) => {
		var max = 0;
        for(let i = 0; i < data.length; i++){
        	var tmp = data[i].GROSS_PROFIT_RATE*100;
        	if(tmp>max){
        		max = tmp;
        	}
            barData1.push((tmp).toFixed(2));
            lineData.push((data[i].GROSS_PROFIT_T_RATE*100).toFixed(2));
        }
        var max = max + 5;
        for(let i = 0; i < data.length; i++){
        	barData2.push(max);
        }
        res.send({barData1,barData2,lineData});
    })

});
//销售架构
router.get('/getSaleSettlement', function(req, res, next) {
    let kindDict = {
        10:'一类',20:'二类',30:'三类',40:'四类',50:'五类',60:'无价类'
    }
	let orgCode = req.query.orgCode || '';

	if(orgCode)
	    orgCode = `AND M.ORG_CODE = ${orgCode}`;

	let sql = `SELECT E.KIND, SUM(M.SALE_AMT) SALE_AMT
                FROM RDC_MALL_GOODS_MONTH M, PUB_GOODSINFO_EXT E
                WHERE M.BARCODE=E.BARCODE ${orgCode}
                GROUP BY E.KIND`

    let result = []
    sqlClient.queryArr(sql).then((data) => {

        for(let i = 0; i < data.length; i++){
            if(data[i].KIND in kindDict){
                result.push({
                    value: data[i].SALE_AMT,
                    name: kindDict[data[i].KIND]
                })
            }
        }
        let theThree = result[2];
        let theFour  = result[3];
        let theFive = result[4];
        result.splice(2,3);
         result.push(theFive);
        result.push(theThree);
        result.push(theFour);
        console.log(result);
        res.send(result);
    })

});
//价格库存
router.get('/getPriceStock', function(req, res, next) {

    let orgCode = req.query.orgCode || '';

    if(orgCode)
        orgCode = `AND M.ORG_CODE = ${orgCode}`;

    let sql = `SELECT M.SALES_MONTH
                  , SUM(M.SALE_MNY)/SUM(M.SALE_AMT*G.OUTPRICE) PRICE_INDEX
                  , SUM(M.SALE_AMT)/SUM(M.AVG_DAY_STORAGE_AMT) STOCK_SALE_RATE
                FROM RDC_MALL_GOODS_MONTH M, PUB_MALLGOODSINFO G
                WHERE M.ORG_CODE=G.ORG_CODE
                      AND M.BARCODE=G.BARCODE
                      AND M.SALES_MONTH BETWEEN '201705' AND '201711'
                      AND M.IS_TOBACCO='01'
                      ${orgCode}
                GROUP BY M.SALES_MONTH ORDER BY M.SALES_MONTH`

    sqlClient.queryArr(sql).then((data) => {

        let month = [], priceIndex = [], stockSaleRate = [],
            result = {
                month,
                priceIndex,
                stockSaleRate
            }
        for(let i = 0; i < data.length; i++){

            month.push(parseInt(data[i].SALES_MONTH.substr(4),10) + '月');
            priceIndex.push(data[i].PRICE_INDEX.toFixed(2));
            stockSaleRate.push(data[i].STOCK_SALE_RATE.toFixed(2));
        }
        res.send(result);
    })

});
//主销规格
router.get('/getMainSales', function(req, res, next) {
	let shopId = req.query.shopId;
	let now = new Date();
	let date = now.getFullYear()+(now.getMonth()<10?'0':'')+now.getMonth();
	let orgCode='11210201';
	let sql = `SELECT
		    A.BARCODE
		  , SALE_AMT
		  , STOCK_RATIO
		  , TURNOVER
		  , PACK_PRICE
		  , BOX_PRICE
		  , GROSS_RATE
		  , GROSS_PROPORTION
		  , GODS_NAME
		FROM
		    RDC_GOODS_MONTH_SALES A
		  , PUB_MALLGOODSINFO B
		WHERE
		    A.BARCODE = B.BARCODE
		    AND A.ORG_CODE=B.ORG_CODE
		    AND A.ORG_CODE='${orgCode}'
		    AND A.SALES_MONTH='${date}'
		    AND A.SALE_AMT >0
	`;
	console.log("getMainSales:"+sql);
	sqlClient.queryArr(sql).then((data) => {
		let result=[];
		if(data&&data.length){
			data.sort((a,b)=>{
				return b.SALE_AMT-a.SALE_AMT;
			});
        	data.forEach(item=>{
        		result.push({
    				no_smoked_item:item.GODS_NAME,
    				sale_amt:item.SALE_AMT&&item.SALE_AMT.toFixed(2),
    				box_price:item.BOX_PRICE&&item.BOX_PRICE.toFixed(2),
		    		pack_price:item.PACK_PRICE&&item.PACK_PRICE.toFixed(2),
		    		turnover:item.TURNOVER&&item.TURNOVER.toFixed(2),
		    		stock_ratio:item.STOCK_RATIO&&item.STOCK_RATIO.toFixed(2),
		    		gross_rate:item.GROSS_RATE&&(item.GROSS_RATE*100).toFixed(2),
					gross_proportion:item.GROSS_PROPORTION&&((item.GROSS_PROPORTION*100).toFixed(2))
		    	})
        	});
		}
		res.send(result);
    });
});
module.exports = router;