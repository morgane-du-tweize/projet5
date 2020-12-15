
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var moviesRouter = require('./routes/movies');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// module.exports.passwd = "lovebeer" ;
const {passwd} = require("./data.js") ;

const options = {
    host: 'localhost',
    port: 3306,
    user: 'momo',
    password: passwd,
    database: 'proj5',
    multipleStatements: true
};
const connection = mysql.createConnection(options);
global.connection = connection ;

const sessionStore = new MySQLStore(options);
app.use(session({
    key: 'session_cookie_name',
    secret: 'keyboard cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 60 * 2000),
        maxAge: 60 * 2000
    }
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     next(createError(404));
// });

// error handler
app.use(function(error, request, response, next) {
    // set locals, only providing error in development
    response.locals.message = error.message;
    response.locals.error = request.app.get('env') === 'development' ? error : {};
    console.log(error);

    // render the error page
    response.status(error.status || 500);
    response.render('error');
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    let sql = " CREATE TABLE IF NOT EXISTS users (userID INT NOT NULL AUTO_INCREMENT, nom VARCHAR (50) NOT NULL, prenom VARCHAR (50) NOT NULL, email VARCHAR (255) NOT NULL, passwd VARCHAR (255) NOT NULL, PRIMARY KEY (userID));  CREATE TABLE IF NOT EXISTS notations (notationID INT PRIMARY KEY NOT NULL AUTO_INCREMENT, userID INT NOT NULL, filmID INT (10) NOT NULL, note INT (1) NOT NULL, CONSTRAINT fk_users_notations FOREIGN KEY (userID) REFERENCES users(userID)); ";

    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
});


module.exports = app;

