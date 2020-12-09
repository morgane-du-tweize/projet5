
var express = require('express');
var router = express.Router();
const axios = require('axios');
const {isConnected, calculateGrade} = require('../functions');

router.get('/:idMovie', function (request, response){
    let userConnected = isConnected (request, response) ;
    let title = "Details du film" ;
    let idUser = null ;
    if (userConnected){
        idUser = request.session.userID ;
    }

    let idOfMovie = request.params.idMovie ;
    let url = 'https://yts.mx/api/v2/movie_details.json?movie_id=' + idOfMovie ;
    axios.get(url)
    .then(function (result) {
  
        let detailsMovie =  result.data.data.movie ;

        let sql = "SELECT * FROM notations WHERE filmID = ?" ;
        let hasAlreadyVoted = false ;
        connection.query (sql, [idOfMovie], function (errors, rows){

            if (userConnected && rows.length > 0){
                for (let aRow of rows){
                    if (aRow.userID == idUser){

                        hasAlreadyVoted = true ;
                    }
                }
            }

            let grade = null ;
            if (rows.length > 0){
                grade = calculateGrade(rows) ;
            }
            response.render('details', {detailsMovie, userConnected, title, rows, hasAlreadyVoted, grade, idUser}) ;
        })

      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
      });
})

router.post('/ratingMovie', function (request, response){
    let bodyOfResponse = request.body ;

    let userGrade = parseInt(bodyOfResponse.grade) ;
    let formerGrades = 'SELECT * FROM notations WHERE filmID = ?' ;
    connection.query (formerGrades, [bodyOfResponse.movie], function (err, rows){

        let newAverage ;
       if (rows.length == 0){
           newAverage = userGrade ;
       }
       else {
            // prevent an user who has already rated a movie, to rate this movie again

           for (let aRow of rows){
                if (bodyOfResponse.user == aRow.userID){
                    let message = "Vous avez déjà voté pour ce film !" ;
                    response.redirect('/') ;
                }
           }

           let sum = 0 ;
           for (let idGrade of rows){
               sum += idGrade.note ;
           }
           sum += userGrade ;
           newAverage = sum / (rows.length +1);
       }

               let values = [
                [
                `${bodyOfResponse.user}`,
                `${bodyOfResponse.movie}`,
                `${userGrade}`
                ]
            ]; 
        let insertNewGrade = `INSERT INTO notations (userID, filmID, note) VALUES ?`;
        connection.query (insertNewGrade, [values], function (err, newRows){
            if (err) throw err ;
            response.status(200).send({newAverage});
        })
    })
})

router.get('/getNotations/:idMovie', function (request, response){
    let idMovie = request.params.idMovie ;    
    
    let sql = 'SELECT * FROM notations WHERE filmID = ?' ;
    connection.query (sql, [idMovie], function (err, rows){
        response.send(rows) ;
    })
})

module.exports = router;