import React, { Component } from 'react';
import Player from './Player/Player';
import PlayerForm from './PlayerForm/PlayerForm';
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import './App.css';
import _ from 'lodash';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      players: [],

    }
    this.addPlayer = this.addPlayer.bind(this);
    //this.vote = this.vote.bind(this);
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

  /*vote(playerToVote, step) {
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
  }*/

  addPlayer(player){
    this.database.push().set({ playerContent: player, votes: 0, rank: 0});
  }

  render() {
    const players = this.state.players;
    const orderedPlayersUp = _.orderBy(players, ['votes'], ['asc']);
    const orderedPlayersDown = _.orderBy(players, ['votes']);
    return (
      <div className="playersWrapper">
        <div className="playersHeader">
          <div className="heading">F <img src={require('./Static/img/4.png'  ) } 
          style={{width: 65, height: 43}} alt={"background"}
          /> </div>
          <div className="subheading">player trends</div>
        </div>
        <div className="playersFooter">
          <PlayerForm addPlayer={this.addPlayer}/>
        </div>

        <div className="playersColumns">
        <div className="playersBody">
          {
            orderedPlayersUp.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            playerId={player.id}
            player={player}
            key={player.id}
            //vote={this.vote}
            />
              )
            })
          }
        </div>
        <div className="playersBody">
          { 
            orderedPlayersDown.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            playerId={player.id}
            player={player}
            key={player.id}
            //vote={this.vote}
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
