const functions = require('firebase-functions');
console.log("In Cloud Functions")
var rank = functions.database.ref('players/{playerId}/votes')
.onUpdate((change, context) => {
    console.log("In Cloud Functions onUpdate")
  var orderedListRef = change.after.ref.root.child('players').orderByChild('votes')
  var oldVotes = change.before.val()
  var newVotes = change.after.val()
  var changeRank = 0
  // went higher in the list so bump every player passed by 1
  if (newVotes > oldVotes) {
    orderedListRef = orderedListRef.endAt(newVotes)
    changeRank = 1
  } else {// went lower in the list so bump every player passed by -1
    orderedListRef = orderedListRef.startAt(oldVotes)
    changeRank = -1
  }
  return orderedListRef.once('value')
  .then((ss) => {
    var promises = []
    var newRank = -1
    var currentRank = -1
    // IMPORTANT: must use `forEach` to ensure proper order
    ss.forEach((playerSS) => {
      if (playerSS.key === context.params.playerId) {
        currentRank = playerSS.child('rank').val()
        return
      }
      if (playerSS.child('votes').val() === newVotes) {
        newRank = playerSS.child('rank').val()
        return
      }
      // only bump players passed in the change
      if (changeRank === 1 && playerSS.child('votes').val() < oldVotes) {
        return
      } else if (changeRank === -1 && playerSS.child('votes').val() > oldVotes) {
        return
      }
      // use transaction to ensure proper number of bumps if multiple changes at once
      promises.push(playerSS.child('rank').ref.transaction((rank) => {
        return rank + changeRank
      }))
    })
    var diff = newRank - currentRank
    // use transaction paired with diff just in case this is also being bumped
    promises.push(change.before.ref.parent.child('rank')
    .transaction((rank) => {
      return rank + diff
    }))
    return Promise.all(promises)
  })
})
