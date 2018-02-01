import React, { Component } from 'react';
import './Player.css';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';

class Player extends Component{

    constructor(props){
        super(props);
        this.playerContent = props.playerContent;
        this.playerId = props.playerId;
        
        this.state = { 
        votedUp: false,
        votedDown: false,
        } 
    }

    componentDidMount() {
      let ref = firebase.database().ref('/players/' + this.playerId + '/voters');

      ref.once('value', snap => {
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
                <span className={`vote up ${this.state.votedUp === true && 'alreadyVotedUp'}`}
                onClick={() => this.handleUpvote(this.playerId)}>
                &#9650;
                </span>
                <p className="playerContent">{this.playerContent}</p>
                <span className={`vote down ${this.state.votedDown === true && 'alreadyVotedDown'}`}
                onClick={() => this.handleDownvote(this.playerId)}>
                &#9660;
                </span>
                
            </div>
        )
    }
}

Player.propTypes = {

    playerContent: PropTypes.string,
}

export default Player;