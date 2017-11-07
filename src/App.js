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
    this.state = {
      players: [],

    }
    this.addPlayer = this.addPlayer.bind(this);
    this.vote = this.vote.bind(this);
    this.app = firebase.initializeApp(DB_CONFIG);
    this.database = this.app.database().ref().child('players');

    this.players = [];
  }

  componentWillMount(){
    const previousPlayers = this.state.players;
    
    this.database.orderByChild('votes').on("child_added", (dataSnapshot) => {
        console.log('new child', dataSnapshot.val())

        this.players.push(dataSnapshot.val());
        this.setState({
          players: this.players
        });
      })
    
    this.database.on('child_added', snap => {
      previousPlayers.push({
        id: snap.key,
        playerContent: snap.val().playerContent,
        votes: snap.val().votes,
        rank: snap.val().rank,
      })
    })    
}

  vote(playerToVote, step) {
    	let updatePlayer = {
        ...playerToVote,
       votes: playerToVote.votes + step
      };
      let index = this.players.indexOf(this.players.
    	filter(player => player.key === playerToVote.key)[0]);
      
      this.players[index] = updatePlayer;
    
      this.database.child(playerToVote.key).set(updatePlayer);
    	this.setState({
      ...this.state,
    	players: this.players
  	});
  }

  addPlayer(player){
    this.database.push().set({ playerContent: player, votes: 0, rank: "neutral"});
  }

  render() {
    const players = this.state.players;
  
    return (
      <div className="playersWrapper">
        <div className="playersHeader">
          <div className="heading">Fantsy <img src={require('./Static/img/4.png'  ) } 
          style={{width: 65, height: 43}} alt={"background"}
          /> </div>
          <div className="subheading">Crowdsourced player trends</div>
        </div>
        <div className="playersFooter">
          <PlayerForm addPlayer={this.addPlayer}/>
        </div>

        <div className="playersColumns">
        <div className="playersBody">
          {
            this.state.players.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            player={player}
            key={player.id}
            />
              )
            })
          }
        </div>
        <div className="playersBody">
          { 
            this.state.players.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            player={player} 
            key={player.id}
            />
              )
            })
          }
          </div>
          </div>
        </div> //playersWrapper
    );
  }
}

export default App;
