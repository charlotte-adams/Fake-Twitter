"use strict";
$(document).ready(function() {
    // forces the AJAX requests to run synchronously
    $.ajaxSetup({
        async: false
    });

    // Show an error if page is not opened on localhost
    if (location.hostname !== 'localhost') {
        $('.error-message-container').removeClass('hidden');
        $('.intro, .after').hide();
    }

    $("#go").click(function() {
        $(".intro").hide();
        runAllTests();
    });
});

function runAllTests() {
    loginTests();
    registerTests();
    followingTests();
    fetchTests();
    addTests();
    // TODO: add more tests!
}

function loginTests() {
    // Test that login works
    testRoute(
        '/login', { login: "bugs", passwd: "bunny" },
        "Attempt to log in as bugs bunny",
        true
    );

    // Test that logging in with incorrect username gives an error
    testRoute(
        '/login', { login: "buugs", passwd: "bunny" },
        "Attempt to log in with incorrect username",
        false
    );


    // Test that logging in with incorrect password gives an error

    testRoute(
        '/login', { login: "bugs", passwd: "bunnny" },
        "Attempt to log in with incorrect password",
        false
    );
}

function registerTests() {
    testRoute(
        '/register', { login: "bugs", passwd: "bunny" },
        "Username bugs is already taken",
        false
    );


    testRoute(
        '/register', { login: "bugsbugsbugsbugsbugs", passwd: "bunny" },
        "Username way too long",
        false
    );


    testRoute(
        '/register', { login: "myrna", passwd: "bunnybunnyubasdjawef" },
        "Password way too long",
        false
    );


    testRoute(
        '/register', { login: "", passwd: "" },
        "Password and login are emptyg",
        false
    );


    testRoute(
        '/register', { login: "white", passwd: "rabbit" },
        "Both meet requirements",
        true
    );

}

function followingTests() {
    // can't subscribe to someone that does not exist
    testRoute(
        '/subscribe', { login: "bugs", passwd: "bunny", feed: "lakjfdgu23" },
        "Bugs attempts to follow non-existing user",
        false
    );


    // can't unsubscribe to someone that does not exist

    testRoute(
        '/unsubscribe', { login: "bugs", passwd: "bunny", feed: "lakjfdgu23" },
        "Bugs attempts to unfollow non-existing user",
        false
    );


    // can't subscribe if already subscribed

    testRoute(
        '/subscribe', { login: "white", passwd: "rabbit", feed: "bugs" },
        "white follows bugs (should succeed)",
        true
    );

    testRoute(
        '/subscribe', { login: "white", passwd: "rabbit", feed: "bugs" },
        "white follows bugs again (should fail)",
        false
    );



    // can't unsubscribe if NOT already subscribed
    testRoute(
        '/unsubscribe', { login: "bugs", passwd: "bunny", feed: "white" },
        "bugs unfollows white (should fail, already not following)",
        false
    );

}

function fetchTests() {
    testRoute(
        '/fetch', { login: 'bugs', passwd: 'bunny' },
        "Get tweets in bugs's feed",
        true
    );
}

function addTests() {
    testRoute(
        '/add', { login: 'bugs', passwd: 'bunny', message: "kfjkdjfkajfj dfjsakjfkd   fjakdja fjkdjakf f ajkflksda f ajfdkfjf dnafjdfjfkdjfjafjdkjf fjkdfj  fkld" },
        'Testing tweet at max of 100 characters',
        true
    );

     testRoute(
        '/add', { login: 'bugs', passwd: 'bunny', message: "kfjkdjfkajfj dfjsakjfkd   fjakdja fjkdjakf f ajkflksda f ajfdkfjf dnafjdfjfkdjfjafjdkjf fjkdfj  fkldm" },
        'Testing tweet at over 100 characters',
        false
    );

}


// route, data (login/password), message
function testRoute(route, data, message, ok) {
    $.post(route, data, displayResult(message, ok));
}

function displayResult(message, ok) {
    return function(data) {

        var panelClass;
        if (ok === data.ok) {
            panelClass = 'panel-success';
        } else {
            panelClass = 'panel-danger';
        }

        $("<div>")
            .addClass('result')
            .addClass('panel')
            .addClass(panelClass)
            .append($('<div>').addClass('panel-heading').text(message))
            .append($('<div>')
                .addClass('panel-body')
                .append($('<pre>').text(JSON.stringify(data, null, '\t'))))
            .appendTo('.results');
    };
}
