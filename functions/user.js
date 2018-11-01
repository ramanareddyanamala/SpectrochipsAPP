var User = require('../models/user');
var Json = require('../models/jsonfiles');
var Pubjson = require('../models/publicjsonfiles');

exports.checkUser = (data,callback) => {

    console.log("request data...",data);
    User.findOne({userID:data.userID}).exec()
        .then((user) => {
            var result = [];
            return Json.findOne({user: user._id},{user:false,_id:false,__v:false,'jsonfiles._id':false}).exec()
                .then(function(jsonfiles){
                    result.push(jsonfiles);
                    return result;
                    //callback({result:'success',data:jsonfiles});
                })
        })
        .then((result) => {

            return Pubjson.findOne({},{_id:false,__v:false}).exec()
                .then(function(issues) {
                    result.push(issues);
                    return result;
                })
        })
        .then((result) => {
                var ujsonfiles = result[0];
                var pjsonfiles = result[1];
                callback({result:'success',userJson:ujsonfiles,publicJson:pjsonfiles});
        })

        .then(undefined, function(err){
            //Handle error
            callback(err);
        })
};

exports.createUser = (data,callback) => {
    User.find({userID:data.userID}).exec()
        .then((user) => {
            if(user.length > 0){
                console.log('user already found with this ID');
                callback({result:'error',message:'userID already exist'});
            }else{
                var usr = new User({
                    userID:data.userID,
                    username:data.username
                });
                usr.save((success) => {
                    console.log(success);
                    callback({result:'success',message:'user successfully created'});
                })
            }
            console.log('user found',user);
        })
        .then(undefined,(err) => {
            callback({result:'error',message:'userID already exist'});
        })
};