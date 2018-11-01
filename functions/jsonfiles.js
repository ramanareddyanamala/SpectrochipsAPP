var Jsonfiles = require('../models/jsonfiles');
var User = require('../models/user');

exports.saveFiles = (data,callback) => {

    User.find({userID:data.userID}).exec()
        .then((result) => {
            console.log(result);
            Jsonfiles.find({user:result[0]._id}).exec()
                .then((jsonfiles) => {
                    if(jsonfiles.length > 0){
                        Jsonfiles.update({user:result[0]._id},{$push:{'jsonfiles':{filename:data.filename,url:data.url}}}).exec()
                            .then((suc) => {
                                console.log(suc);
                                callback({result:'success',message:'successfully inserted'});
                            })
                    }else{

                        var jsfile = new Jsonfiles({
                            jsonfiles:[{
                                filename:data.filename,
                                url : data.url
                            }],
                            user:result[0]._id
                        });

                        jsfile.save((success) => {
                            console.log(success);
                            callback({result:'success',message:'stored successfully'});
                        })
                    }
                })
                .then(undefined, function(err){
                    //Handle error
                    callback(err);
                })
        })
}