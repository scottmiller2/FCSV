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

  constructor(props) {
    super(props);

    this.addPlayer = this.addPlayer.bind(this);
    this.downvotePlayer = this.downvotePlayer.bind(this);
    this.upvotePlayer = this.upvotePlayer.bind(this);
    this.database = firebase.database().ref().child('players');
    this.userLogIn = this.userLogIn.bind(this);
    this.userLogOut = this.userLogOut.bind(this);
    this.uid = null;
    this.userScore = 0;
    
    this.state = {
      players: [],
      user: null,
      weekTabVisible: null,
      byeTabVisible: null
    }
    this.players = [];
  }
  

  componentWillMount() {
    
    const previousPlayers = this.state.players;

    this.database.on('child_added', snap => {
      previousPlayers.push({
        id: snap.key,
        playerContent: snap.val().playerContent,
        votes: snap.val().votes
      })

      this.database.on('child_changed', function (snapshot) {
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
        this.uid = user.uid;
      }
    });
  }
  addPlayer(player) {

    this.state.user ?
      this.database.push().set({ playerContent: player, votes: 0})
      :
      console.log("Not Logged In")
  }

  byeTab() {
    this.setState({ byeTabVisible: !this.state.byeTabVisible })
  }

  closeByeTab() {
    var x = document.getElementById("byes");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }

  closeWeekTab() {
    var x = this.refs.weekHeading;
    if (x.display === "none") {
      x.display = "block";
    } else {
      x.style.display = "none";
    }
  }

  //Trending influence — UID of the logged in user is put into the player's voter child
  //with a -1 to denote a downvote
  downvotePlayer(playerId) {
    if(this.state.user) {

      let ref = firebase.database().ref('/players/' + playerId + '/voters');

      ref.once('value', snap => {
        var value = snap.val()
        console.log(value)
        if (value !== null) {
            console.log("Exists ")
            
            ref.child(this.uid).once('value', snap => {

              if (snap.val() === 1 || snap.val() === 0 || snap.val() === null){
                ref.child(this.uid).set(-1);
                
                //Added vote balancing
                this.database.child(playerId).transaction(function(player) {
                  if (player) {
                    player.votes--
                  }
                  return player;
                })

              } else if (snap.val() === -1) {
                ref.child(this.uid).set(0);

                //Added vote balancing
                this.database.child(playerId).transaction(function(player) {
                  if (player) {
                    player.votes++
                  }
                  return player;
                })

                }
              else {
                  console.log("Error in downvoting. snap.val(): " + snap.val())
              }
            
            })

        } else {
            console.log("Doesn't exist")
            ref.child(this.uid).set(-1);

            //Added vote balancing
            this.database.child(playerId).transaction(function(player) {
              if (player) {
                player.votes--
              }
              return player;
            })
        }
    });
   }
   else {
        console.log("Must be logged in to vote.")
    }
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
        console.log("UID: " + this.state.uid)
      });
  }

  //Trending influence — UID of the logged in user is put into the player's voter child
  //with a 1 to denote an upvote
  upvotePlayer(playerId) {
    if(this.state.user) {
      let ref = firebase.database().ref('/players/' + playerId + '/voters'); 

      ref.once('value', snap => {
        var value = snap.val()
        if (value !== null) {            
            ref.child(this.uid).once('value', snap => {
              if (snap.val() === 0 || snap.val() === -1 || snap.val() == null){
                ref.child(this.uid).set(1);
              
               //Added vote balancing 
               this.database.child(playerId).transaction(function(player) {
                 if (player) {
                   player.votes++
                 }
                 return player;
               })

              } else if (snap.val() === 1) {
              ref.child(this.uid).set(0);

              //Added vote balancing
              this.database.child(playerId).transaction(function(player) {
                if (player) {
                  player.votes--
                }
                return player;
              })


              }
              else {
                console.log("Error in upvoting. snap.val(): " + snap.val())
              }

            })

        } else {
            console.log("Doesn't exist")
            ref.child(this.uid).set(1);

            //Added vote balancing
            this.database.child(playerId).transaction(function(player) {
              if (player) {
                player.votes++
              }
              return player;
            })
        }
    }); 
  }
   else {
        console.log("Must be logged in to vote.")
    }
  }

  weekTab() {
    this.setState({ weekTabVisible: !this.state.weekTabVisible })
  }

  render() {
    const players = this.state.players;
    const orderedPlayersUp = _.orderBy(players, ['votes'], ['desc']);
    const orderedPlayersDown = _.orderBy(players, ['votes']);
    let hideWeek = this.state.weekTabVisible ? "none" : "block"
    return (
      <div className="playersWrapper">
        <div className="userBar">
        {
          this.state.user ?
            <div className='user-profile'>
              <img className='profile-image' onClick={this.userLogOut} src={this.state.user.photoURL} alt={"userphoto"} />
              <span className='user-score'> {this.userScore} </span>
            </div>
            :
            console.log("You must be logged in to contribute.")
        }
        {
          this.state.user ?
            console.log("")
            :
            <div className="authArea"><button className="loginSignUpOut" onClick={this.userLogIn}>Sign In</button></div>
        }
        </div>
        <div className="titleBar">
          <div className="heading">Fantsy <img src={require('./Static/img/4.png')}
             className="fantsy-image" alt={"background"} />
            <div className="subheading">Crowdsourced Player trends</div>
          </div>

        </div>


        <div className="searchBar">
          <PlayerForm addPlayer={this.addPlayer}
                      upvotePlayer={this.upvotePlayer}
                      downvotePlayer={this.downvotePlayer} />
          
        </div>

        <span style={{ display: hideWeek }} className="weekHeading"><a style={{ display: hideWeek }} className="closeTab" onClick={this.weekTab.bind(this)}>x</a><br/> 2018 NFL Draft — Thursday, April 26th - Saturday, April 28th</span>
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
                    userLogIn={this.userLogIn}
                    userLogOut={this.userLogOut}
                    uid={this.uid}
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
                    userLogIn={this.userLogIn}
                    userLogOut={this.userLogOut}
                    uid={this.uid}
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
