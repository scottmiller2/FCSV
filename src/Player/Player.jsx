import React, { Component } from 'react';
import './Player.css';
import PropTypes from 'prop-types';


class Player extends Component{

    constructor(props){
        super(props);
        this.playerContent = props.playerContent;
        this.playerId = props.playerId;
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
                <span className="vote up"
                onClick={() => this.handleUpvote(this.playerId)}>
                &#9650;
                </span>
                <p className="playerContent">{this.playerContent}</p>
                <span className="vote down" 
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