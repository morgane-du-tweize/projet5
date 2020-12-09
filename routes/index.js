const express = require('express');

const { compareSync } = require('bcrypt');
const router = express.Router();
const {isConnected} = require('../functions');

const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const axios = require('axios');
const saltRounds = 10;

const {checkAgainstDB, } = require ('../functions') ;

const genres = ['action', 'adventure', 'animation', 'comedy', 'crime', 'drama', 'fantasy',' horror', 'mystery', 'romance', 'sci-fi', 'superhero', 'thriller'];

router.get('/', function(request, response, next) {
    let title = 'Movies app homepage';
    let userConnected ;
    let connected = request.session ;

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

    axios.get('https://yts.mx/api/v2/list_movies.json')
    .then(function (result) {

        let listOf20movies = result.data.data.movies;

        response.render('accueil', {title, genres, userConnected, listOf20movies});

    })
    .catch(function (error) {
        console.log(error);
    })
    .then(function () {
    });
});

router.get('/getMovieNotation/:filmID', function (request, response){

   let movieID = request.params.filmID ;
   let values = `${movieID}` ;
   let sql = 'SELECT note FROM notations WHERE filmID = ? ;' ;

   connection.query(sql, [values], (err,rows) => {
        if(err) throw err;
        users = rows ;
        response.send( { rows});
    })
})

router.post('/login', function(request, response)  {
    checkAgainstDB (request, response) ;
});

router.get('/login', (request, response) => {
    userConnected = false ;
    let title = 'Login page';
    response.render('connexion', {title, userConnected});
})

router.get('/signup', function (request, response, next){
    let title = 'Signup form';
    response.render('signUpForm', {title});
})

router.post('/signup',
[ 
    check('nom').exists().isLength({min: 3}).trim().not().isEmpty().escape(),
    check('prenom').exists().isLength({min: 3}).trim().not().isEmpty().escape(),
    check('email', 'Your email is not valid').not().isEmpty().isEmail().normalizeEmail(),
    check('confirmPassword', 'Your password must be at least 8 characters').not().isEmpty(),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password) ),
    check('confirmPassword', 'Password must include one lowercase character, one uppercase character, a number, and a special character and must be at least 8 characters.').isLength({ min: 8 })
    .matches(
              /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
            )

], function (request, response){
    const errors = validationResult(request);
    let newUser = request.body ;

    if (errors.isEmpty() && newUser.nom != "" && newUser.prenom != "") {
        newUser = JSON.parse(JSON.stringify(newUser));
    
        let requestToCheckMail = 'SELECT * FROM users WHERE email = ?';
        connection.query(requestToCheckMail, [newUser.email], function (err, result) {
            if (result.length == 0){
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(newUser["password"], salt);
                let passwd = hash;
        
                let values = [
                    [
                    `${newUser.nom}`,
                    `${newUser.prenom}`,
                    `${newUser.email}`,
                    `${passwd}`
                    ]
                ];    
                let sql = `INSERT INTO users (nom, prenom, email, passwd) VALUES ?`;
                connection.query(sql, [values], function (err, rows) {
                    if (err) throw err;
                    response.redirect('/');
                });
            }
            else {
                let message = "Utilisateur déjà présent dans la base de données" ;
                handleErrors(response, message);
            }
        });
    }

    else {
        let message = "erreur dans les paramètres d'inscription" ;
        handleErrors(response, message);
    }
})

router.get('/logout', function (request, response) {

    request.session.destroy() ;
    response.redirect('../');
});

module.exports = router;
