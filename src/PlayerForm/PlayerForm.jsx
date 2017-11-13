import React, { Component } from 'react';
import './PlayerForm.css';

class PlayerForm extends Component {
    constructor(props) {
        super(props);
        this.state= {
            newPlayerContent: ''
        };
        this.handleUserInput = this.handleUserInput.bind(this);
        this.writePlayer = this.writePlayer.bind(this);
    }

// When the user input changes, set the newPlayerContent
// to the value of whats in the input box
handleUserInput(e){
    this.setState({
        newPlayerContent: e.target.value, // the value of the text input
    })
}

writePlayer(){
    // call a method that sets the playerContent for a player to
    // the value of the input
    if (/^[a-zA-Z]+$/.test(this.state.newPlayerContent)) {
        this.props.addPlayer(this.state.newPlayerContent);
        console.log("Verified all letters")
        // Set newPlayerContent back to an empty string. 
        this.setState({
            newPlayerContent: '',
        })
    }
    else {
        console.log("Non-letter character found in: " + this.state.newPlayerContent)
    }

}

    render(){
        return(
            <div className="searchArea">
                <input className="playerInput"
                placeholder="Search by player name" 
                value={this.state.newPlayerContent} 
                onChange={this.handleUserInput} />
            <button className="upvoteButton" onClick={this.writePlayer}>&#9650;</button>
            <button className="downvoteButton" onClick={this.writePlayer}>&#9660;</button>
            </div>
        )
    }
}

export default PlayerForm;