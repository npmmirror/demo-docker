var express = require('express');
var router = express.Router();
var sqlClient = require('../../db/SqlClient');

//获取全国以及地市信息
router.get('/getTargets', function(req, res, next) {
	let city = req.query.city;
	let barcode = req.query.barcode;
	let now = new Date();
	let date = "201712";

	let sql = `SELECT 
				AVG(MEDIAN_PRICE) MEDIAN_PRICE
				FROM RDC_GODS_MONTH_PRICE A,PUB_MALLGOODSINFO B
				WHERE A.BARCODE=B.BARCODE AND A.ORG_CODE=B.ORG_CODE AND A.BARCODE = '`+barcode+`' AND A.SALES_MONTH='`+date+`'` ;
	if(city){
		sql += `AND A.ORG_CODE='`+city+`'`;
	}
	console.log(sql);
	sqlClient.queryOne(sql).then((repData) => {
		let v = "0";
		let n = "a";
        let data;
	    if(city&&city=='11210201'){
	    	data = [
				{name: '中山区',value: v ,godsName:n},
				{name: '西岗区',value: v ,godsName:n},
				{name: '沙河口区',value: v ,godsName:n},
				{name: '甘井子区',value: v ,godsName:n},
				{name: '旅顺口区',value: v ,godsName:n},
				{name: '金州区',value: v ,godsName:n},
				{name: '长海县',value: v ,godsName:n},
				{name: '瓦房店市',value: v ,godsName:n},
				{name: '普兰店区',value: v ,godsName:n},
				{name: '庄河市',value: v ,godsName:n}
			];
	    }else{
	    	data = [
				{name: '西藏',value: -1 ,godsName:n},
				{name: '上海',value: -1 ,godsName:n},
				{name: '江苏',value: -1 ,godsName:n},
				{name: '浙江',value: -1 ,godsName:n},
				{name: '深圳',value: -1 ,godsName:n},
				{name: '新疆',value: -1 ,godsName:n},
				{name: '甘肃',value: -1 ,godsName:n},
				{name: '福建',value: -1 ,godsName:n},
				{name: '云南',value: -1 ,godsName:n},
				{name: '海南',value: -1 ,godsName:n},
				{name: '湖南',value: -1 ,godsName:n},
				{name: '贵州',value: -1 ,godsName:n},
				{name: '黑龙江',value: -1 ,godsName:n},
				{name: '四川',value: -1 ,godsName:n},
				{name: '广东',value: -1 ,godsName:n},
				{name: '江西',value: -1 ,godsName:n},
				{name: '重庆',value: -1 ,godsName:n},
				{name: '青海',value: -1 ,godsName:n},
				{name: '广西',value: -1 ,godsName:n},
				{name: '河南',value: -1 ,godsName:n},
				{name: '湖北',value: -1 ,godsName:n},
				{name: '安徽',value: -1 ,godsName:n},
				{name: '内蒙古',value: -1 ,godsName:n},
				{name: '吉林',value: -1 ,godsName:n},
				{name: '宁夏',value: -1 ,godsName:n},
				{name: '河北',value: -1 ,godsName:n},
				{name: '北京',value: 13 ,godsName:n},
				{name: '辽宁',value: -1 ,godsName:n},
				{name: '大连',value: v ,godsName:n},
				{name: '天津',value: -1 ,godsName:n},
				{name: '山东',value: -1 ,godsName:n},
				{name: '陕西',value: -1 ,godsName:n},
				{name: '山西',value: -1 ,godsName:n},
				{name: '香港',value: -1,godsName:n},
				{name: '澳门',value: -1,godsName:n},
				{name: '台湾',value: -1,godsName:n},
				{name: '南海诸岛',value: -1,godsName:n}
			];
	    }
	    res.send(data);
    });
	
    
});
//消费者比例
router.get('/getCumsterData',function(req, res, next){
	let city = req.query.city;
	let barcode = req.query.barcode;
	let now = new Date();
    let date = "201712";

	let sql = `SELECT MALE_18 V1, MALE_20 V2, MALE_30 V3, MALE_40 V4, MALE_50 V5
			FROM RDC_GOODS_CONSUMER_MONTH
			WHERE BARCODE='`+barcode+`'
			  AND SALES_MONTH = '`+date+`'
			` ;
	if(city){
		sql += `AND ORG_CODE='`+city+`'`;
	}
	console.log("getCumsterData:"+sql);
	sqlClient.queryOne(sql).then((data) => {
		if(data){
        	res.send([data.V1,data.V2,data.V3,data.V4,data.V5]);
		}
    });
	
});
//价格
router.get('/getPrice',function(req, res, next){
	let now = new Date();
	let month = 12;
	let axisData = [];
	for(let i=0;i<6;i++){
		axisData.push((month-i)+'月');
	}
	let city = req.query.city;
	let barcode = req.query.barcode;
	let dateEnd = now.getFullYear()+((now.getMonth())<10?'0':'')+(now.getMonth());
	let dateBegin = now.getFullYear()+((now.getMonth()-5)<10?'0':'')+(now.getMonth()-5);

	let sql = `SELECT SALES_MONTH,MAX_PRICE,MIN_PRICE,MEDIAN_PRICE,Q1_PRICE,Q3_PRICE
		FROM RDC_GODS_MONTH_PRICE
		WHERE SALES_MONTH BETWEEN '`+dateBegin+`' AND '`+dateEnd+`'
		  AND BARCODE = '`+barcode+`'` ;
	if(city){
		sql += `AND ORG_CODE='`+city+`'`;
	}
	sql+=' ORDER BY SALES_MONTH ASC'
	console.log("getPrice:"+sql);
	
	sqlClient.queryArr(sql).then((data) => {
		let boxData=[];
		data.forEach(item=>{
			//最低 下四分位 中位 上四分卫 最高
			boxData.push([item.MIN_PRICE.toFixed(2),item.Q1_PRICE.toFixed(2),item.MEDIAN_PRICE.toFixed(2),item.Q3_PRICE.toFixed(2),item.MAX_PRICE.toFixed(2)]);
		});
        res.send({
        	axisData: axisData.reverse(),
        	boxData:boxData
        });
    });
	
});
//条盒比 customerNumber:消费者总数；
router.get('/getTobaccoData',function(req,res,next){
	
	let city = req.query.city;
	let barcode = req.query.barcode;
	let now = new Date();
    let date = "201712";

	let sql = `SELECT MALE, FEMALE,GODS_NAME
			FROM RDC_GOODS_CONSUMER_MONTH A,PUB_MALLGOODSINFO B
			WHERE A.BARCODE=B.BARCODE AND A.ORG_CODE=B.ORG_CODE AND A.BARCODE='`+barcode+`'
			  AND A.SALES_MONTH = '`+date+`'
			` ;
	if(city){
		sql += `AND A.ORG_CODE='`+city+`'`;
	}
	console.log("getTobaccoData:"+sql);
	sqlClient.queryOne(sql).then((data) => {
		if(data){
        	res.send({
				tobaccoName:data.GODS_NAME,
				customerNumber:data.MALE+data.FEMALE,
				tobaccoData:[{value:data.MALE,name:'男',selected:'selected'},{value:data.FEMALE,name:'女'}]}
        	);
		}
    });
	

	
	
//	let data = {
//		tobaccoName:'玉溪',
//		customerNumber:'345',
//		tobaccoData:[{value:40,name:'40%'},{value:60,name:'60%'}]};
//	res.send(data);
});
//社会存销比
router.get('/getPriceIndex',function(req, res, next){
	let now = new Date();
	let month = 12;
	let axisData = [];
	for(let i=0;i<6;i++){
		axisData.push((month-i)+'月');
	}
	
	let city = req.query.city;
	let barcode = req.query.barcode;
	let dateEnd = now.getFullYear()+((now.getMonth())<10?'0':'')+(now.getMonth());
	let dateBegin = now.getFullYear()+((now.getMonth()-5)<10?'0':'')+(now.getMonth()-5);
	
	let sql = `SELECT SALES_MONTH,STOCK_AVG,SALE_AMT,STOCK_RATIO,TURNOVER
		FROM RDC_GOODS_MONTH_SALES
		WHERE SALES_MONTH BETWEEN '`+dateBegin+`' AND '`+dateEnd+`'
		  AND BARCODE = '`+barcode+`'` ;
	if(city){
		sql += `AND ORG_CODE='`+city+`'`;
	}
	sql+=` ORDER BY SALES_MONTH ASC`;
	console.log("getPriceIndex:"+sql);
	sqlClient.queryArr(sql).then((data) => {
		data=data||[];
		let stockSaleRatio=[],stockTurnover=[];
		data.forEach(item=>{
			//最低 下四分位 中位 上四分卫 最高
			stockSaleRatio.push(item.STOCK_RATIO.toFixed(2));
			stockTurnover.push(item.TURNOVER.toFixed(2));
		});
        res.send({
        	axisData: axisData.reverse(),
        	stockSaleRatio:stockSaleRatio,
        	stockTurnover:stockTurnover
        });
    });
});

//卷烟销售前50的店铺
router.get('/getShopsMessage',function(req,res,next){
	let city = req.query.city;
	let barcode = req.query.barcode;
	let now = new Date();
    let date = "201712";

	let sql = `SELECT SHOP_ID,SALE_AMT,SALE_MNY,SALE_NUM,GROSS_PROFIT,SHOP_NAME
			FROM RDC_CUST_GOODS_MONTH
			WHERE BARCODE='`+barcode+`'
			  AND SALES_MONTH = '`+date+`'`;
	if(city){
		sql += `AND ORG_CODE='`+city+`'`;
	}
	sql +=` ORDER BY SALE_AMT DESC
			LIMIT 50` ;
	console.log("getShopsMessage:"+sql);
	
	sqlClient.queryArr(sql).then((data) => {
		let result = [];
		data.forEach(item=>{
       		result.push({
       			item:item.SHOP_NAME,
       			shopId:item.SHOP_ID,
       			saleNumber:item.SALE_NUM,
       			sale:item.SALE_MNY,
       			money:item.SALE_AMT,
       			gross_profit:item.GROSS_PROFIT,
       		});
		})
        res.send(result);
    });
})

module.exports = router;