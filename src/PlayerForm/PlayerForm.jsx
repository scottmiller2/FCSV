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

    // Set newPlayerContent back to an empty string. 
    this.props.addPlayer(this.state.newPlayerContent);
    
    this.setState({
        newPlayerContent: '',
    })
}
    render(){
        return(
            <div className="formWrapper">
                <input className="playerInput"
                placeholder="Search by player name" 
                value={this.state.newPlayerContent} 
                onChange={this.handleUserInput} />
                <button className="playerButton" onClick={this.writePlayer}>Search</button>
            </div>
        )
    }
}

export default PlayerForm;