var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/auth', function(req, res, next) {
	var userName = req.query.userName.toUpperCase();
	var password = req.query.password;
	var users = [
		{
			userName:"SUPERADMIN",
			password:"1"
		},
		{
			userName:"ADMIN",
			password:"1"
		}
	];
	for(var user of users){
		if(user.userName == userName && user.password == password){
			res.send({
				authResult:"success",
				data:{
					userName:user.userName
				}
			})
		}
	}
	res.send({
		authResult:"fail",
		data:""
	})
});

module.exports = router;