import React, { Component } from 'react';
import './Player.css';
import PropTypes from 'prop-types';


class Player extends Component{

    constructor(props){
        super(props);
        this.playerContent = props.playerContent;
        this.votes = props.player.votes;
        this.key = props.key;
        this.handleVote = this.handleVote.bind(this);
    }

    handleVote(player, step){
        //this.props.vote(this.player, this.step);
    }

    render(props){
        return(
            <div className="player fade-in">
                <span className="vote up"
                onClick={this.handleVote(this.player, +1)}>
                &#9651;
                </span>
                <p className="playerContent">{this.playerContent}</p>
                <span className="vote down" 
                onClick={this.handleVote(this.player, -1)}>
                &#9661;
                </span>
                
            </div>
        )
    }
}

Player.propTypes = {

    playerContent: PropTypes.string,
}

export default Player;