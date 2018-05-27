import React, { Component } from 'react';
import './Player.css';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';

class Player extends Component{

    constructor(props){
        super(props);
        this.playerContent = props.playerContent;
        this.rank = props.rank;
        this.playerId = props.playerId;
        
        this.state = { 
        votedUp: false,
        votedDown: false,
        } 
    }

    componentDidMount() {

    /*make this a function instead which can be called elsewhere to assure
    when a user logs in it can be called and their votes are shown rather than
    requiring a refresh*/
      let ref = firebase.database().ref('playersVotes/' + this.playerId); 

      ref.on('value', snap => {
        var value = snap.val()

        if (value !== null && this.props.uid !== null) {      
            ref.child(this.props.uid).once('value', snap => {
              if (snap.val() === 1){
                this.setState({ votedUp: true, votedDown: false })
                }
              else if (snap.val() === 0) {
                this.setState({ votedUp: false, votedDown: false })
              }
              else if (snap.val() === -1) {
                this.setState({ votedDown: true, votedUp: false })
              }
              else {
              console.log("Error calculating the vote.")
              }
            })
        } else {
          //Error
        }
    });

      }

    handleUpvote(id){
        this.props.upvotePlayer(id)
    }

    handleDownvote(id){
        this.props.downvotePlayer(id)
    }

    render(props){
        return(
            <div className="player fade-in">
                <span className="badges" id="prevRank">{this.rank}<br/> <span className="badgesPrev" id="prevRank">0</span></span>
                <p className="playerContent">{this.playerContent}</p>
                <span>
                
                <span className={`vote up ${this.state.votedUp === true && 'alreadyVotedUp'}`}
                onClick={() => this.handleUpvote(this.playerId)}>
                &#9650;
                </span>
                <br/>
                <span className={`vote down ${this.state.votedDown === true && 'alreadyVotedDown'}`}
                onClick={() => this.handleDownvote(this.playerId)}>
                &#9660;
                </span>
                </span>
                
            </div>
        )
    }
}

Player.propTypes = {

    playerContent: PropTypes.string,
}

export default Player;