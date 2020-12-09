const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;


function checkAgainstDB (request, response) {
    console.log('lancement methode checkagainstDB') ;
    let email = request.body.email;
    let password = request.body.password;
    console.log('email ===', email) ;
    if (email && password) {

        connection.query('SELECT * FROM users WHERE email = ?', [email], function(error, results, fields) {
            console.log("je me connecte à la database \n") ;
            if (error){
                response.send('Problem with user');
            }
            bcrypt.compare(password, results[0].passwd, function(err, result) {
                if (err){
                    let messageError = "Problem with user or password !" ;
                    handleErrors(response, messageError) ;
                }
                else if (result){
                    request.session.email = email;
                    request.session.userID = results[0].userID;
                    console.log('yeah user connecté \n');
                    response.redirect('/');
                }
                else {
                    response.send('Incorrect Username and/or Password!');
                }
                response.end();
            });
        });
    }
}

function checkAuth(request, response) {
    let titre = "Veuillez vous authentifier à nouveau" ;
    if (request.session.userID) {
        return true ;
    }
    return false ;
}

function isConnected (request, response) {
    let userConnected ;

    let connected = request.session ;

    // index navbar links are different according if user is connected or not
    if (request.session.userID === undefined || typeof request.session.userID === 'undefined'  ||   typeof connected === 'undefined' || connected === undefined){
        userConnected = false ;
    }

    else if (typeof request.session.userID == undefined || request.session == undefined){
        userConnected = false ;
    }
    else {
        if(request.session.userID) {
            userConnected = true ;
        }
    }
    return userConnected ;
}

function calculateGrade (grade) {
    let average = 0 ;
    for (let idGrade of grade) {
        average += idGrade.note ;
    }
    return average / grade.length ;
}

exports.isConnected = isConnected ;
exports.checkAgainstDB = checkAgainstDB ;
exports.checkAuth = checkAuth ;
exports.calculateGrade = calculateGrade ;