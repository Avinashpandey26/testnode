var express = require('express');
var app = express();
var path = require("path");
const MySQL = require('mysql');
const Bcrypt = require('bcrypt');
session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
 

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.user && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};
const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_name'
});

connection.connect();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function (req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/welcome',function (req, res) {
    res.sendFile(path.join(__dirname + '/welcome.html'));
});

app.get('/logout',auth,function (req, res) {
	req.session.destroy();
    res.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/register',function (req, res) {
	//req.session.destroy();
	//console.log("checking register");
    res.sendFile(path.join(__dirname + '/index.html'));
});
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/success',function(req, res){
        const username = req.body.inputfirst;
        const email = req.body.inputEmail;
        const password = req.body.inputPassword;
        var salt = Bcrypt.genSaltSync();
        var encryptedPassword = Bcrypt.hashSync(password, salt);
        var orgPassword = Bcrypt.compareSync(password, encryptedPassword);
        connection.query('INSERT INTO users (username,email,password) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '")', function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            //reply(results);
        });
 res.sendFile(path.join(__dirname + '/page.html'));
});

app.get('/reset', function (req, res) {
    res.sendFile(path.join(__dirname + '/reset.html'));
});
app.post('/checklogin', function (request, reply) {
        const email = request.body.email;
        const password = request.body.password;
        connection.query('SELECT uid, username, email,password FROM users WHERE email = "'+ email +'" AND password = "'+ password +'"', function (error, results, fields) {
            if (error) throw error;
            //console.log(results);
            if(results.length >0){
            var newemail = results[0].email;
            var newpassword = results[0].password;
            if (!request.body.email || !request.body.password) {
    		reply.send('login failed');    
  			} else if(request.body.email == newemail || request.body.password == newpassword) {
   			    request.session.user = results[0].email;
    			request.session.admin = true;
    			//reply.send("login success!");
    			reply.sendFile(path.join(__dirname + '/welcome.html'));
  			}
  		   }
  			else{
  				//reply.send("Invalid Login ID or Password!");
  				res.redirect('/' + request.body.email);
  			}
           // checkData(results);
            //$('#name').val((results[0].username));
        });
        /*function checkData(results){
		console.log(results);
		}
		*/
    
});

var server = app.listen(8081,"127.0.0.1", function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s/", host, port)
});
