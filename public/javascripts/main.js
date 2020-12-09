// searchbar by title on homepage
$(document).ready(function(){
    $('#searchTitle').on('submit', function(event){
        event.preventDefault();
        let searchText = $('#searchText').val();
        getTitleMovies(searchText);
        
    });
});


function getTitleMovies(searchText){
    let url = `https://yts.mx/api/v2/list_movies.json?query_term=${searchText}` ;

    $.get(url)
    .then(function(response) {
        let resultOfSearch = response.data.movies ;
        if (resultOfSearch){
            $('li').remove();
            for (aMovie of resultOfSearch){
                $('#titleOfTheMovie').append(`<li class="list-group-item"><a href="/movies/${aMovie.id}"> ${aMovie.title}</a></li><br>`);
            }
        }
        else {
            $('li').remove();
        }
    })
    .catch(function(error){
        console.log(error);
    })
}





// serch for movie according to genre
$(document).ready(function(){
    $('#searchGenre').on('submit', function(event){
        event.preventDefault();
        let searchText = $('#movieGenre').val();
        console.log('VOUS RECHERCHEZ LE GENRE SUIVANT :', searchText) ;

        
        let url = `https://yts.mx/api/v2/list_movies.json?genre=${searchText}` ;

        $.get(url)
        .then(function(response) {
            let resultOfSearch = response.data.movies ;
            console.log('RESULTAT ======', resultOfSearch) ;
            if (resultOfSearch){
                $('li').remove();
                for (aMovie of resultOfSearch){
                    $('#genreOfTheMovie').append(`<li class="list-group-item"><a href="/movies/${aMovie.id}"> ${aMovie.title}</a></li><br>`);
                }
            }
            else {
                $('li').remove();
            }
        })
        .catch(function(error){
            console.log(error);
        })        
    });
});


// display grades and number of votes of 20 movie on index page
$(document).ready(function(){

    let movies =$('.20MoviesTitle');

    for (const movie of movies){

        let idMovie = $(movie).find('.hiddenIdMovie').text() ;

        $.ajax({
            url: `/movies/getNotations/${idMovie}`,
            method: 'GET',
            dataType: 'JSON', 

            success : function (data, status){
                if (data.length > 0){
                    let movieID = data[0].filmID ;
                    $(`#${movieID} .numberOfVotes`).text(data.length);
                    $(`#${movieID} .grade`).text(calculateGrade(data).toFixed(2));
                }
            }
        })
     }

});    


function calculateGrade (grade) {
    let average = 0 ;
    for (let idGrade of grade) {
        average += idGrade.note ;
    }
    return average / grade.length ;
}


$(document).ready(function(){
    $('#rateMovie').submit('click', function (event){
        event.preventDefault();

        let userOfID = $('#userID').text();
        let movieID = $('#movieID').text();
        let movieGrade = $('#ratingMovie').val() ;

        let formData = {
            'user' :userOfID,
            'movie': movieID,
            'grade': movieGrade
        } ;

        $.ajax({
            url: '/movies/ratingMovie',
            type: 'POST',
            data: formData,
            dataType:'json',

            success: function (data, status){
                $('#movieGrade').text(data.newAverage.toFixed(2));
                $('#rateMovie').addClass("hidden");
            },
            error: function (res, status, error){
                console.log("erreur ====", error);
            },
            complete: function(resultat, status){

            }
        })
    })

})