import React, { Component } from 'react';
import Player from './Player/Player';
import PlayerForm from './PlayerForm/PlayerForm';
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import './App.css';

class App extends Component {

  constructor(props){
    super(props);
    this.addPlayer = this.addPlayer.bind(this);
    this.downvotePlayer = this.downvotePlayer.bind(this);
    this.upvotePlayer = this.upvotePlayer.bind(this);

    this.app = firebase.initializeApp(DB_CONFIG);
    this.database = this.app.database().ref().child('players');


    // We're going to setup the React state of our component
    this.state = {
      players: [],

    }
  }
  

  componentWillMount(){
    const previousPlayers = this.state.players;

    
    // DataSnapshots
    this.database.on('child_added', snap => {
      previousPlayers.push({
        id: snap.key,
        playerContent: snap.val().playerContent,
        votes: snap.val().votes,
      })

    //Update data when a childs info is changed
    //variable changedVote is assigned the value being changed
    this.database.on("child_changed", function(snapshot) {
      var changedVote = snapshot.val();
      console.log("new value: " + changedVote.votes)
      });

    this.setState({
      players: previousPlayers
      })
    })
  }

  //
  //Add player and set the players votes to 0
  //Will need to check to see if the player is already added, eventually
  addPlayer(player){
    this.database.push().set({ playerContent: player, votes: 0});
  }

  //Trending influence
  downvotePlayer(playerId){
    this.database.child(playerId).transaction(function (player) {
        if (player) {
            player.votes--
        }
        return player;
    });
}
  upvotePlayer(playerId){
    this.database.child(playerId).transaction(function (player) {
      if (player) {
          player.votes++
      }
      return player;
  });
}
  
  render() {
    return (
      <div className="playersWrapper">
        <div className="playersHeader">
          <div className="heading">Fantsy <img src={require('./Static/img/4.png'  ) } 
          style={{width: 65, height: 43}}
          /> </div>
          <div className="subheading">Crowdsourced player trends</div>
        </div>
        <div className="playersFooter">
          <PlayerForm addPlayer={this.addPlayer}/>
        </div>


        <div className="playersBody">
          {
            
            this.state.players.map((player) => {
              return (
            <Player playerContent={player.playerContent}
            playerId={player.id} 
            key={player.id}
            downvotePlayer={this.downvotePlayer}
            upvotePlayer={this.upvotePlayer} />
              )
            })


          }
        </div>
        
        </div>
    );
  }
}

export default App;
