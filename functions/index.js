const functions = require('firebase-functions');
var admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.votePlayer = functions.https.onCall((request, response) => {
    const playerToVote = request.query.playerToVote;

    if (playerToVote === null) {
        return response.status(404).send({
            "success": false,
            "message": "Missing parameter: `playerToVote: String`."
          });
    }

    const userWhoVote = request.query.userWhoVote;
    if (userWhoVote === null) {
        return response.status(404).send({
            "success": false,
            "message": "Missing parameter: `userWhoVote: String`."
          });
    }

    const upVote = request.query.upVote;
    if (upVote === null) {
        return response.status(404).send({
            "success": false,
            "message": "Missing parameter: `upVote: Boolean`."
        });
    }

    const rootReference = admin.database().ref();
    return rootReference.child('playersVotes/' + playerToVote + '/' + userWhoVote).once('value', function(snapshot) {
        if (snapshot.val()) {
            return response.status(404).send({
                "success": false,
                "message": "You already voted for this player."
            });
        } else {
            var promises = [];
            const saveUserIDPromise = rootReference.child('playersVotes/' + playerToVote + '/' + userWhoVote).set(true)
            promises.push(saveUserIDPromise)
            const updateVotesPromise = rootReference.child('players/' + playerToVote + '/votes').transaction(function(currentValue) {
                if (currentValue === null) {
                    return 0;
                }
                if (upVote === true) {
                    return currentValue + 1;
                } else {
                    return currentValue - 1;
                }
            });
            promises.push(updateVotesPromise)
            
            Promise.all(promises).then(() => {
                return response.status(200).send({
                    "success": true
                })
            }).catch(error => {
                console.error(error);
            });                
        }
    });
});

exports.getTopPlayers = functions.https.onRequest((request, response) => {
    var playersArray = [];
    const rootReference = admin.database().ref();

    return rootReference.child('players').once('value', function(snapshot) {
        snapshot.forEach(function(aSnapshot) {
            playersArray.push(aSnapshot.val())
        })

        playersArray = playersArray.sort(function(first, second) {
            return first.votes < second.votes;
        });

        var topVotes = playersArray[0]["votes"];
        var rankNumber = 1;
        
        playersArray[0]["rank"] = rankNumber;
        playersArray.forEach(function (aPlayer) {
            if (aPlayer.votes < topVotes) {
                rankNumber += 1;
                topVotes = aPlayer.votes;
            }
            aPlayer["rank"] = rankNumber;
        });

        return response.status(200).send(playersArray);
    });
})