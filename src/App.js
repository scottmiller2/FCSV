import React, { Component } from 'react';
import Player from './Player/Player';
import PlayerForm from './PlayerForm/PlayerForm';
import { DB_CONFIG } from './Config/config';
import * as firebase from 'firebase';
import './App.css';
import _ from 'lodash';
import Alert from 'react-s-alert';
import './alert.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import 'react-s-alert/dist/s-alert-css-effects/genie.css';
import 'firebase/firestore'

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

firebase.initializeApp(DB_CONFIG)

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
require("firebase/firestore");
let screenSize = window.innerWidth;

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
    this.toggle = this.toggle.bind(this);
    
    this.state = {
      players: [],
      user: null,
      weekTabVisible: true, //was null
      byeTabVisible: null,
      isOpen: false,
      dropdownOpen: false
    }

    this.players = [];
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  //Alert the user when an upvote is registered
  alertUpVote() {
    Alert.success('Successful Upvote!', {
        position: 'top-right',
        effect: 'slide',
        beep: false,
        timeout: 2000,
        offset: 58
    });
  }
  alertUpVoteSmall() {
    Alert.success('Successful Upvote!', {
        position: 'bottom',
        effect: 'slide',
        onShow: function () {
            console.log('alertUpvote fired!')
        },
        beep: false,
        timeout: 2000,
        offset: 0
    });
  }
  alertRemoveVote() {
    Alert.warning('Removed vote', {
        position: 'top-right',
        effect: 'slide',
        onShow: function () {
            console.log('removevote fired!')
        },
        beep: false,
        timeout: 2000,
        offset: 58
    });
  }
  alertRemoveVoteSmall() {
    Alert.warning('Removed vote', {
        position: 'bottom',
        effect: 'slide',
        onShow: function () {
            console.log('removevote fired!')
        },
        beep: false,
        timeout: 2000,
        offset: 0
    });
  }
  alertDownVote() {
    Alert.error('Successful Downvote!', {
        position: 'top-right',
        effect: 'slide',
        beep: false,
        timeout: 2000,
        offset: 58
    });
  }
  alertDownVoteSmall() {
    Alert.error('Successful Downvote!', {
        position: 'bottom',
        effect: 'slide',
        onShow: function () {
            console.log('downvote fired!')
        },
        beep: false,
        timeout: 2000,
        offset: 0
    });
  }
  alertNotLoggedIn() {
    Alert.error('You must log in to vote', {
        position: 'bottom',
        effect: 'genie',
        onShow: function () {
            console.log('must be logged in fired!')
        },
        beep: false,
        timeout: 3000,
        offset: 0
    });
  }

  alertPermission() {
    Alert.error('You do not have permission to add players yet', {
        position: 'bottom',
        effect: 'genie',
        onShow: function () {
            console.log("")
        },
        beep: false,
        timeout: 3000,
        offset: 0
    });
  }
  alertLoggedOut() {
    Alert.success('You have been successfully logged out', {
        position: 'bottom',
        effect: 'genie',
        onShow: function () {
            console.log("")
        },
        beep: false,
        timeout: 3000,
        offset: 0
    });
  }
  alertLoggedIn() {
    Alert.success('You have been successfully logged in', {
        position: 'bottom',
        effect: 'genie',
        onShow: function () {
            console.log("")
        },
        beep: false,
        timeout: 3000,
        offset: 0
    });
  }

  componentWillMount() {
    
    const previousPlayers = this.state.players;

    this.database.on('child_added', snap => {
      previousPlayers.push({
        id: snap.key,
        playerContent: snap.val().playerContent,
        votes: snap.val().votes,
        rank: snap.val().rank
      })

      this.database.on('child_changed', function (snapshot) {
        var name = snapshot.val();
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
    //later should be if mod == true or group == .. to confirm admin
    if(this.state.user && (this.uid === "vKl6rIUuI0WsbeWVORz3twPUfnd2") || this.uid === "um9Emv54qbVbuaITHlmJSh2fphx2"){
      this.database.push().set({ playerContent: player, votes: 0, rank: 0})
      }
      else if (this.state.user && this.uid !== "vKl6rIUuI0WsbeWVORz3twPUfnd2"){
      this.alertPermission()
      console.log("Must not be money")
      }
    else{
      this.alertNotLoggedIn()
    }
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
    const players = this.state.players;
    const orderedPlayersRank = _.orderBy(players, ['votes'], ['desc'])
    if(this.state.user) {

      let ref = firebase.database().ref('playersVotes/' + playerId); 

      ref.once('value', snap => {
        var value = snap.val()
        if (value !== null) {
            ref.child(this.uid).once('value', snap => {

              //If vote had been previously retaracted or is null
              if (snap.val() === 0 || snap.val() === null){
                ref.child(this.uid).set(-1);
                if(screenSize < 700){
                  this.alertDownVoteSmall();
                  }
                  else{
                  this.alertDownVote();
                  }
                //Added vote balancing
                this.database.child(playerId).transaction(function(player) {
                  if (player) {
                    player.votes--
                  }
                  return player;
                })
                //If the current vote is an upvote
                } else if (snap.val() === 1){
                ref.child(this.uid).set(-1);
                if(screenSize < 700){
                  this.alertDownVoteSmall();
                  }
                  else{
                  this.alertDownVote();
                  }
               //Added vote balancing 
               this.database.child(playerId).transaction(function(player) {
                 if (player) {
                   player.votes--
                   player.votes--
                 }
                 return player;
               })

              //If the current vote is a downvote
              } else if (snap.val() === -1) {
                ref.child(this.uid).set(0);
                if(screenSize < 700){
                  this.alertRemoveVoteSmall();
                  }
                  else{
                  this.alertRemoveVote();
                  }
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
        //If the player doesn't exist and is being downvoted
        } else {
            console.log("Doesn't exist")
            ref.child(this.uid).set(-1);
            if(screenSize < 700){
              this.alertDownVoteSmall();
              }
              else{
              this.alertDownVote();
              }
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
        this.alertNotLoggedIn()
        console.log("Must be logged in to vote.")
   }
  }


  userLogOut() {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null
        });
        this.alertLoggedOut()
      });
  }

  userLogIn() {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
        console.log("UID: " + user.uid)
        this.alertLoggedIn()
    });
  }

  //Trending influence — UID of the logged in user is put into the player's voter child
  //with a 1 to denote an upvote
  upvotePlayer(playerId) {
    const players = this.state.players;
    const orderedPlayersRank = _.orderBy(players, ['votes'], ['desc'])

    if(this.state.user) {
      let ref = firebase.database().ref('playersVotes/' + playerId); 

      ref.once('value', snap => {
        var value = snap.val()

        //If there is a record currently available
        if (value !== null) {            
            ref.child(this.uid).once('value', snap => {
              //If the current vote has been previously retracted or is null
              if (snap.val() === 0 || snap.val() == null){
                ref.child(this.uid).set(1);
                if(screenSize < 700){
                this.alertUpVoteSmall();
                }
                else{
                this.alertUpVote();
                }
               //Added vote balancing 
               this.database.child(playerId).transaction(function(player) {
                 if (player) {
                   player.votes++
                 }
                 return player;
               })

              //If the current vote is a downvote
              } else if (snap.val() === -1){
                ref.child(this.uid).set(1);
                if(screenSize < 700){
                this.alertUpVoteSmall();
                }
                else{
                this.alertUpVote();
                }

               this.database.child(playerId).transaction(function(player) {
                 if (player) {
                   player.votes++
                   player.votes++
                 }
                 return player;
               })

              //If the current vote is an upvote
              } else if (snap.val() === 1) {
              ref.child(this.uid).set(0);
              if(screenSize < 700){
                this.alertRemoveVoteSmall();
                }
                else{
                this.alertRemoveVote();
                }
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
            //If the current player is not in the DB and has not been voted on by this user
            ref.child(this.uid).set(1);
            this.alertUpVote()
            //Added vote balancing
            this.database.child(playerId).transaction(function(player) {
              if (player) {
                player.votes++
                console.log("Player added")
              }
              return player;
            })
        }
    });
  }
   else {
        this.alertNotLoggedIn()
        console.log("Must be logged in to vote.")
    }
  }

  weekTab() {
    this.setState({ weekTabVisible: !this.state.weekTabVisible })
  }

  render() {
    const players = this.state.players;
    const orderedPlayersUp = _.orderBy(players, ['votes'], ['desc']).filter(p => p.votes >= 0);
    const orderedPlayersDown = _.orderBy(players, ['votes'],).filter(p => p.votes < 0);

    let hideWeek = this.state.weekTabVisible ? "none" : "block"
    return (
      <div className="playersWrapper">
      <div className="userBar">
        <Navbar  className="otp" color="light" light expand="xs">
          <NavbarBrand><div className="brandText">Fantsy <img className="logo" src={require('./Static/img/4.png')}></img></div></NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar  className="navBarLinks">
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink className="menuLinks" href="#">About</NavLink>
              </NavItem> 
              {
              this.state.user ?
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle className="menuLinks" nav caret>
                  Profile
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem className="menuLinks">
                    <a src="#">My Activity</a>
                  </DropdownItem>
                  <DropdownItem className="menuLinks" onClick={this.userLogOut}>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              :
              <NavItem>
              <NavLink className="menuLinks" onClick={this.userLogIn}>Login</NavLink>
              </NavItem>
              }            
            </Nav>
          </Collapse>
        </Navbar>
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
                    rank={player.rank}
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
                    rank={player.rank}
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
        <span className ="alert"><Alert stack={{limit: 3}} /></span>
      </div> //playersWrapper 
    );
  }
}

export default App;
