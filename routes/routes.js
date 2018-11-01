var userFunction = require('../functions/user');
var jsonFunction = require('../functions/jsonfiles');
const Busboy = require('busboy');
const fileUpload = require('express-fileupload');

module.exports = function(app,io) {


	io.on('connection', function(socket){

		console.log("Client Connected");
        connectCounter++;

        socket.on('disconnect',function(){
            console.log('user disconnected');
            connectCounter--;
        });

        console.log('connected client size..',connectCounter);

  		socket.on('test',function () {
			console.log('test data..');
			io.emit('test','welcome to vedas sample TCP connection');
        });

  		socket.on('addchart',function(cha){
  		    console.log('add chart',cha);
  		    charts.createCharts(cha,(result) => {
  		        console.log('add charts...',result);

                charts.loadCharts((result2) => {
                    console.log('before sending', result2);
                    io.emit('charts', result2);
                })
            })
        });

  		socket.on('fetch',function (upchart) {
            console.log('file is updating..', upchart);
            charts.updateCharts(upchart, (result) => {
                console.log('result of update chart..', result);
                //socket.broadcast.emit('broadcast', 'hello friends!');
                charts.loadCharts((result2) => {
                    console.log('before sending', result2);
                    io.emit('charts', result2);
                })
            });
        });

  		socket.on('charts',function (upchart) {

  		    if(typeof upchart == 'undefined') {

                charts.loadCharts((result) => {
                    console.log('load charts info..', result);
                    io.emit('charts', result);
                });

            }else{

                console.log('file is updating..', upchart);
                charts.updateCharts(upchart, (result) => {
                    console.log('result of update chart..', result);
                    charts.loadCharts((result2) => {
                        console.log('before sending',result2);
                        io.emit('charts', result2);
                    })
                });

            }
        });

  		socket.on('add user',function (data) {
			console.log('user data..',data);

			userFunction.userregister(data.name,data.username,data.password,function (result) {
				console.log('result set from db',result);
					io.emit('register user',result)
                    //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });

        socket.on('login',function (data) {
            console.log('user login data..',data);

            userLogin.userLogin(data.username,data.password,function (result) {
                console.log('result set from db',result);
                io.emit('login',result);

                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });
        socket.on('change',function (data) {
            console.log('user change pass data..',data);

            userFunction.changePassword(data.username,data.oldpassword,data.newpassword,function (result) {
                console.log('result set from db',result);
                io.emit('change',result)
                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });

        });
		socket.on('forgot',function (data) {
            console.log('user forgot pass.',data);

            userLogin.userForgot(data.username,function (result) {
                console.log('result set from db',result);
                io.emit('forgot',result)
                //io.emit('login', {numUsers: result.numUsers, socketid: socket.id});
            });
        })
        socket.on('file',function (data) {
			console.log('file input data...',data);
            var t=Date.now();
            fs.writeFile('/Users/apple/Desktop/TCPServer/public/images/'+t+data.filename, data.byte, function(err) {
                if (err){
                    throw err;
                    io.emit('file',{result:'error',message:'file not saved'});
				} else{
                    console.log('It\'s saved!');
                    io.emit('file',{result:'success',url:'http://192.168.1.103:8080/image/'+t+data.filename});
				}
        });
        })

	});

	io.on('disconnect',function () {

        connectCounter--;
    });

	app.get('/',(req,res) => {
	   res.render('index',{title:'SpectroChips'});
    });

    app.post('/spectrochips/user',(req,res) => {
        console.log('request body...',req.body);
        if(typeof req.body.userID == 'undefined' || typeof req.body.username == 'undefined'){
            res.json({result:'error',message:'please provide the valid data'});
        }else{
            userFunction.createUser(req.body,(result) => {
                console.log('result from function..',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/json', (req,res) => {
        console.log('request body..',req.body);
        if(typeof req.body.userID == 'undefined' || typeof req.body.filename == 'undefined' || typeof req.body.url == 'undefined'){
            res.json({result:'error',message:'please provide the valid data'});
        }else{
            jsonFunction.saveFiles(req.body,(result) => {
                console.log('result from function..',result);
                res.json(result);
            })
        }
    });

    app.post('/spectrochips/login',(req,res) => {
        console.log('req body...',req.body);
        if(typeof req.body.userID == 'undefined'){
            res.json({result:'error',message:'please provide the UserID'});
        }else{
            userFunction.checkUser(req.body,(result) => {
                console.log('result from func..',result);
                res.json(result);
            })
        }
    });

    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }));
    app.post('/spectrochips/json/upload', function (req, res, next) {

         function uploadToS3(file) {
             file.mv(__dirname+file.name, function(err) {
                 if (err)
                     return res.status(500).send(err);

                 res.send('File uploaded!');
             });
        }
        // This grabs the additional parameters so in this case passing in
        // "element1" with a value.

        const element1 = req.body.element1;

        var busboy = new Busboy({ headers: req.headers });

        // The file upload has completed
        busboy.on('finish', function() {
            console.log('Upload finished');

            // Your files are stored in req.files. In this case,
            // you only have one and it's req.files.element2:
            // This returns:
            // {
            //    element2: {
            //      data: ...contents of the file...,
            //      name: 'Example.jpg',
            //      encoding: '7bit',
            //      mimetype: 'image/png',
            //      truncated: false,
            //      size: 959480
            //    }
            // }

            // Grabs your file object from the request.
            const file = req.files.element2;
            console.log(file);

            // Begins the upload to the AWS S3
            uploadToS3(file);

        });

        req.pipe(busboy);
    });
};

