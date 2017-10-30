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

  //Add player and set the players votes to 0
  //Will need to check to see if the player is already added, eventually
  addPlayer(player){
    this.database.push().set({ playerContent: player, votes: 0});
  }

  removePlayer(playerId){
    this.database.child(playerId).remove();
  }

  downvotePlayer(playerId){
    this.database.child(playerId).votes--;
    this.database = this.app.database().ref().child('votes');
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
        <div className="trendTitles"><span className="trendTitlesText">Trending Up</span> <span className="trendTitlesText"> Trending Down</span> <span className="trendTitlesText"> Injured
        </span>
        </div>
        <div className="playersBody">
          {
            this.state.players.map((player) => {
              return (
            <Player playerContent={player.playerContent}
            playerId={player.id} 
            key={player.id}
            removePlayer={this.removePlayer}
            downvotePlayer={this.downvotePlayer} />
         )
        })
        }
        </div>
        
        </div>
    );
  }
}

export default App;
