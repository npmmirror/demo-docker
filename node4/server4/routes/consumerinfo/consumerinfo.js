var express = require('express');
var router = express.Router();
var sqlClient = require('../../db/SqlClient');

//消费者标签
router.get('/getConsumerTags', function(req, res, next) {
	let peopleId = req.query.peopleId;
	let orgCode = req.query.orgCode;
	var sql = `
		SELECT GENDER,AGE,TAGS
		FROM CS_PEOPLE
		WHERE ORG_CODE= '${orgCode}'
		  AND PEOPLE_ID = '${peopleId}'
	`;
	sqlClient.queryOne(sql).then((data) => {
        res.send(data);
    });
});
//消费者购买历史
router.get('/getConsumerRecord', function(req, res, next) {
	let peopleId = req.query.peopleId;
	let orgCode = req.query.orgCode;
	var sql = `
		SELECT BRANDNAME1,BRANDSCALE1,BRANDNAME2,BRANDSCALE2,BRANDNAME3,BRANDSCALE3
		FROM CS_PEOPLE
		WHERE ORG_CODE= '${orgCode}'
		  AND PEOPLE_ID = '${peopleId}'
	`;
	sqlClient.queryOne(sql).then((data) => {
        res.send(data);
    });
});
//消费轨迹
router.get('/getConsumerTrail', function(req, res, next) {
	//红点
	var result = [];
	result.push({name: '红点1',value: [121.71496877,39.0915,Math.ceil(Math.random()*10)]});
	result.push({name: '红点2',value: [121.63545000,38.9206,Math.ceil(Math.random()*10)]});
	result.push({name: '黄点1',value: [121.60379200,38.9112,Math.ceil(Math.random()*10)]});
	result.push({name: '黄点2',value: [121.51551862,38.9744,Math.ceil(Math.random()*10)]});
	result.push({name: '绿点1',value: [121.15967296,38.8135,Math.ceil(Math.random()*10)]});
	result.push({name: '绿点2',value: [121.77849300,39.0463,Math.ceil(Math.random()*10)]});
	result.push({name: '绿点3',value: [121.63197000,38.9203,Math.ceil(Math.random()*10)]});
	result.push({name: '绿点4',value: [121.71110900,39.1138,Math.ceil(Math.random()*10)]});
	result.push({name: '绿点5',value: [121.48410164,38.9723,Math.ceil(Math.random()*10)]});
	res.send(result);
});
//卷烟购买历史
router.get('/getTobaccoData',function(req,res,next){
	
	let buyParams = req.query.buyParams;
	
	sql = `select CREA_TIME,SALE_ITEM,SALE_MNY ,SHOP_NAME SALE_AMT from IRT_REALTIME_SALE_DETAIL order by rand() LIMIT 4`;
	sqlClient.queryArr(sql).then(function(data){
		let k= 0;
		let date = ['11-30','10-20','09-30','08-04','07-21','06-02',
					'11-15','10-10','09-23','08-08','07-04','06-13',
					'11-18','10-03','09-24','08-12','07-30','06-20',
					'11-29','10-01','09-05','08-18','07-21','06-15',];
		//购买记录为0的月份
		let recode = [];
		
		for(let i=0;i<buyParams.length;i++){
			if(buyParams[i] == 0){
				recode.push(date[i]);
				recode.push(date[i+6]);
				recode.push(date[i+12]);
				recode.push(date[i+18]);
			}
		}
		//删除购买记录为0 的月份
		for(let i=0;i<recode.length;i++){
			var index = date.indexOf(recode[i]);
			if (index > -1) {
				date.splice(index, 1);
			}
		}
		for(let i=0;i<data.length;i++){
			var index = Math.floor((Math.random()*date.length)); 
			data[i].CREA_TIME =date[index] +' '+data[i].CREA_TIME.substring(0,2)+':'+data[i].CREA_TIME.substring(2,4)+':'+data[i].CREA_TIME.substring(4,6);
			data[i].SALE_AMT = data[i].SALE_ITEM.split(';')[0].split('*')[1];
			data[i].SALE_ITEM = data[i].SALE_ITEM.split(';')[0].split('*')[0];	
		}
		res.send(data);
	});
})
module.exports = router;