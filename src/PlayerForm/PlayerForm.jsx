import React, { Component } from 'react';
import './PlayerForm.css';
import * as firebase from 'firebase';

//Added 5/21
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButtonDropdown,
    InputGroupDropdown,
    Input,
    Button,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
   } from 'reactstrap';

//End

class PlayerForm extends Component {
    constructor(props) {
        super(props);

        this.playersRef = firebase.database().ref();

        this.state= {
            newPlayerContent: '',
            duplicate: false,
        };
 
        this.handleUserInput = this.handleUserInput.bind(this);
        this.writePlayerUp = this.writePlayerUp.bind(this);
        this.writePlayerDown = this.writePlayerDown.bind(this);
        this.checkIfUserExists = this.checkIfUserExists.bind(this);
    }

checkIfUserExists(newPlayerContent) {
    this.playersRef.child('players').orderByChild("playerContent").equalTo(newPlayerContent).once("value",snapshot => {
        const userData = snapshot.val();
        if (userData){
          this.state.duplicate = true;
        }
        else{
          this.state.duplicate = false;
        }
    });
}


handleUserInput(e){
    this.setState({
        newPlayerContent: e.target.value,
    })
}

writePlayerUp(newPlayerContent){
    if (/^[a-zA-Z\s]*$/.test(this.state.newPlayerContent) && this.state.newPlayerContent !== "") {
        this.checkIfUserExists(this.state.newPlayerContent);
        
        //Cycle through the players in the database to see if the entered player string is already present. If the player
        //is NOT found, an upvote is cast.
        if(this.state.duplicate !== true){
        this.props.addPlayer(this.state.newPlayerContent);
        
        this.playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
        snapshot.forEach(child => {
            const key = child.key
            
            this.props.upvotePlayer(key);
            })
        });
        
        this.setState({
            newPlayerContent: '',
            })
        }

        //Legal string enetered and player has been found in the database. An upvote is cast.
        else{
            this.playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
            snapshot.forEach(child => {
                const key = child.key
                this.props.upvotePlayer(key);
            })
         
         });
         this.setState({
            newPlayerContent: '',
        })
       }
    }
    else {
        console.log("Non-letter character found in: " + this.state.newPlayerContent)
        this.setState({
            newPlayerContent: '',
        })
    }
}

writePlayerDown(newPlayerContent){
    if (/^[a-zA-Z\s]*$/.test(this.state.newPlayerContent) && this.state.newPlayerContent !== "") {
        this.checkIfUserExists(this.state.newPlayerContent);
        
        //Cycle through the players in the database to see if the entered player string is already present. If the player
        //is NOT found, a downvote is cast.
        if(this.state.duplicate !== true){
        this.props.addPlayer(this.state.newPlayerContent);
        
        //Cycling through players
        this.playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
        snapshot.forEach(child => {
            const key = child.key            
            this.props.downvotePlayer(key)
            })
        });
        
        this.setState({
            newPlayerContent: '',
            })
        }
        //Legal player string is entered and the player has been found in the database. A vote is cast.
        else{
            this.playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
            snapshot.forEach(child => {
                const key = child.key
                this.props.downvotePlayer(key)
            })
         });
         this.setState({
            newPlayerContent: '',
        })
       }
    }
    else {
        console.log("Non-letter character found in: " + this.state.newPlayerContent)
        this.setState({
            newPlayerContent: '',
        })
    }

}

    render(){
        return(
            <div className="searchArea">
                <input className="playerInput"
                placeholder="Vote by player by name" 
                value={this.state.newPlayerContent} 
                onChange={this.handleUserInput} />
            <button className="upvoteButton" onClick={this.writePlayerUp}>&#9650;</button>
            <button className="downvoteButton" onClick={this.writePlayerDown}>&#9660;</button>
            </div>
        )
    }
}

export default PlayerForm;