var OptPool = require('./ConnectionPool');
var optPool = new OptPool(); 
var pool = optPool.getPool(); 

function queryOne(sql){
	//console.log("执行sql==="+sql);
	var promise =  new Promise(function(resolve, reject){
		pool.getConnection(function(err,conn){
			conn.query(sql,function(err, rs){
				if (err) { 
			      console.log('[query] - :'+err); 
			      return; 
			    }
				if(rs){
					if(rs.length > 0){
						resolve(rs[0]);
					}else{
						resolve(null);
					}
				}
				
				conn.release();
			})
		})
	}).catch(function(err){
		console.log(err);
	})
	return promise;
}

function queryArr(sql){
	//console.log("执行sql==="+sql);
	var promise =  new Promise(function(resolve, reject){
		pool.getConnection(function(err,conn){
			conn.query(sql,function(err, rs){
				if (err) { 
			      console.log('[query] - :'+err); 
			      return; 
			  	}
				resolve(rs);
				conn.release();
			})
		})
	}).catch(function(err){
		console.log(err);
	})
	return promise;
}

function insert(sql){
	var promise =  new Promise(function(resolve, reject){
		pool.getConnection(function(err,conn){
			conn.query(sql,function(err, rs){
				if (err) { 
			      console.log('[query] - :'+err); 
			      return; 
			  	}
				resolve(rs);
				conn.release();
			})
		})
	}).catch(function(err){
		console.log(err);
	})
	return promise;
}

module.exports = {queryOne,queryArr,insert};
