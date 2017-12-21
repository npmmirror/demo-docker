var mysql = require('mysql'); //调用MySQL模块 
function OptPool(){ 
  this.flag=true; //是否连接过 
  this.pool = mysql.createPool({   
    host: 'mysql',    //主机 
    user: 'root',        //MySQL认证用户名 
    password: 'root',    //MySQL认证用户密码 
    database: 'demo3', 
    port: '3306'          //端口号 
  }); 
  
  this.getPool=function(){ 
     return this.pool; 
  } 
}; 
module.exports = OptPool;