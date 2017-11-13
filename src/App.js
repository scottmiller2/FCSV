import React, { Component } from 'react';
import Player from './Player/Player';
import PlayerForm from './PlayerForm/PlayerForm';
import { DB_CONFIG } from './Config/config';
import * as firebase from 'firebase';
import './App.css';
import _ from 'lodash';

firebase.initializeApp(DB_CONFIG)

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends Component {

  constructor(props){
    super(props);

    this.addPlayer = this.addPlayer.bind(this);
    this.downvotePlayer = this.downvotePlayer.bind(this);
    this.upvotePlayer = this.upvotePlayer.bind(this);
    this.database = firebase.database().ref().child('players');
    this.userLogIn = this.userLogIn.bind(this);
    this.userLogOut = this.userLogOut.bind(this);

    this.state = {
      players: [],
      user: null //sets user's inital load-in to unauthenticated
    }

    this.players = [];
  }

  componentWillMount(){
    const previousPlayers = this.state.players;

    this.database.on('child_added', snap => {
      previousPlayers.push({
        id: snap.key,
        playerContent: snap.val().playerContent,
        votes: snap.val().votes,
        rank: snap.val().rank,
      })
   
    
    this.database.on('child_changed', function(snapshot) {
      var name = snapshot.val();
      console.log("Player: " + name.playerContent + " has  " + name.votes + " votes.")
    })

    this.setState({
      players: previousPlayers
      }); 
  })
}
  componentDidMount() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      this.setState({ user });
      } 
    });
  }
  addPlayer(player){
    {
      this.state.user ?
      this.database.push().set({ playerContent: player, votes: 0, rank: 0})
    :
      console.log("Not Logged In")
    }
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



  userLogOut() {
    auth.signOut()
    .then(() => {
      this.setState({
        user: null
      });
    });
  }

  userLogIn() {
    auth.signInWithPopup(provider) 
      .then((result) => {
       const user = result.user;
       this.setState({
        user
      });
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
    const players = this.state.players;
    const orderedPlayersUp = _.orderBy(players, ['votes'], ['desc']);
    const orderedPlayersDown = _.orderBy(players, ['votes']);
    return (
      <div className="playersWrapper">
        <div className="playersHeader">
        {
        this.state.user ?
        <div className='user-profile'>
        <img className='user-profile' onClick={ this.userLogOut } src={this.state.user.photoURL} />
      </div>
        :
        console.log("You must be logged in to contribute.")
        }
        {
        this.state.user ?
        console.log("You must be logged in to contribute.")
        :
        <span className="authArea"><button className="loginSignUpOut" onClick={this.userLogIn}>Sign In</button></span>
        }
          <div className="heading">Fantsy <img src={require('./Static/img/4.png'  ) } 
          style={{width: 65, height: 43}} alt={"background"}
          /> </div>
          <div className="subheading">Crowdsourced Player trends</div>
        </div>

        <div className="playersFooter">
          <PlayerForm addPlayer={this.addPlayer}/>
        </div>
       <span className="weekHeading">Week 8 — Thursday Night Football — Seahawks vs. Cardinals</span>
        <span className="byes">BYES: Arizona, Green Bay, Jacksonville, Los Angeles Rams, New York Giants, Tennessee</span>
        <div className="playersColumns">
        <div className="playersBody">
          <span className="trendHeaderUp">TRENDING UP</span>
          {
            orderedPlayersUp.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            playerId={player.id}
            key={player.id}
            upvotePlayer={this.upvotePlayer}
            downvotePlayer={this.downvotePlayer}
            userLogIn = {this.userLogIn}
            userLogOut = {this.userLogOut}
            />
              )
            })
          }
        </div>
        <div className="playersBody">
        <span className="trendHeaderDown">TRENDING DOWN</span>
          { 
            orderedPlayersDown.map((player) => {
              return (
            <Player 
            playerContent={player.playerContent}
            playerId={player.id}
            key={player.id}
            upvotePlayer={this.upvotePlayer}
            downvotePlayer={this.downvotePlayer}
            userLogIn = {this.userLogIn}
            userLogOut = {this.userLogOut}
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
