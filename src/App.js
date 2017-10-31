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
    this.removePlayer = this.removePlayer.bind(this);
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
      })

    this.setState({
      players: previousPlayers
      })
    })

    this.database.on('child_removed', snap => {
      for(var i=0; i < previousPlayers.length; i++){
        if(previousPlayers[i].id === snap.key){
          previousPlayers.splice(i, 1);
        }
      }

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

  //Initial remove player
  removePlayer(playerId){
    this.database.child(playerId).remove();
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

        <div class="container body-content" id="main">
  <div class="row category">
    <div class="col-md-4">
      <div class="col-heading">
        TRENDING UP
      </div>
      <ul class="list-group">
        <li class="list-group-item plyr up">
          <a href="#"><span class="vote u">+</span></a>
          <span>JuJu Smith-Shuster</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
        <li class="list-group-item plyr up">
          <a href="#"><span class="vote u">+</span></a>
          <span>Tevin Coleman</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
        <li class="list-group-item plyr up">
          <a href="#"><span class="vote u">+</span></a>
          <span>Jesse James</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
      </ul>
    </div>
    <div class="col-md-4">
      <div class="col-heading">
        TRENDING DOWN
      </div>
      <ul class="list-group">
        <li class="list-group-item plyr down">
          <a href="#"><span class="vote u">+</span></a>
          <span>Martavis Bryant</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
        <li class="list-group-item plyr down">
          <a href="#"><span class="vote u">+</span></a>
          <span>Jamison Crowder</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
        <li class="list-group-item plyr down">
          <a href="#"><span class="vote u">+</span></a>
          <span>Corey Davis</span>
          <a href="#"><span class="vote d">-</span></a>
        </li>
      </ul>
    </div>
    <div class="col-md-4">
      <div class="col-heading">
        INJURED
      </div>
      <ul class="list-group">
        <li class="list-group-item plyr injured">
          <span>Aaron Rodgers</span>
        </li>
        <li class="list-group-item plyr injured">
          <span>Zach Miller</span>
        </li>
      </ul>
    </div>
  </div>
</div>
        
        
        
        
        <div className="playersBody">
          {
            this.state.players.map((player) => {
              return (
            <Player playerContent={player.playerContent}
            playerId={player.id} 
            key={player.id}
            removePlayer={this.removePlayer}
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
