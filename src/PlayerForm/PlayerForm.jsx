import React, { Component } from 'react';
import './PlayerForm.css';
import * as firebase from 'firebase';

class PlayerForm extends Component {
    constructor(props) {
        super(props);
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
    console.log("in checkIfUserExists")

    var playersRef = firebase.database().ref();
    playersRef.child('players').orderByChild("playerContent").equalTo(newPlayerContent).once("value",snapshot => {
        const userData = snapshot.val();
        if (userData){
          console.log("exists!");

          this.state.duplicate = true;
          
          console.log(this.state.duplicate)
        }
        else{
          console.log("does not exist.")
          this.state.duplicate = false;
          console.log(this.state.duplicate)
        }
    });
}


handleUserInput(e){
    this.setState({
        newPlayerContent: e.target.value,
    })
}

writePlayerUp(newPlayerContent){
    if (/^[a-zA-Z\s]*$/.test(this.state.newPlayerContent)) {
        this.checkIfUserExists(this.state.newPlayerContent);
        
        if(this.state.duplicate !== true){
        this.props.addPlayer(this.state.newPlayerContent);
        
        var playersRef = firebase.database().ref();
        playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            const key = child.key
            playersRef.child('players/'+key).update({
                votes: data.votes + 1,
                
                })
            })
        });
        
        this.setState({
            newPlayerContent: '',
            })
        }

        //Add below code here to manipulate vote count of newly added player (first vote)
        else{
            var playersRef = firebase.database().ref();
            playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
            snapshot.forEach(child => {
                const data = child.val();
                const key = child.key
                playersRef.child('players/'+key).update({
                    votes: data.votes + 1,
                    
                })
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
    if (/^[a-zA-Z\s]*$/.test(this.state.newPlayerContent)) {
        this.checkIfUserExists(this.state.newPlayerContent);
        
        if(this.state.duplicate !== true){
        this.props.addPlayer(this.state.newPlayerContent);
        
        var playersRef = firebase.database().ref();
        playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            const key = child.key
            playersRef.child('players/'+key).update({
                votes: data.votes - 1,
                
                })
            })
        });
        
        this.setState({
            newPlayerContent: '',
            })
        }
        else{
            var playersRef = firebase.database().ref();
            playersRef.child('players').orderByChild("playerContent").equalTo(this.state.newPlayerContent).once("value",snapshot => {
            snapshot.forEach(child => {
                const data = child.val();
                const key = child.key
                playersRef.child('players/'+key).update({
                    votes: data.votes - 1,
                    
                })
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
                placeholder="Search by player name" 
                value={this.state.newPlayerContent} 
                onChange={this.handleUserInput} />
            <button className="upvoteButton" onClick={this.writePlayerUp}>&#9650;</button>
            <button className="downvoteButton" onClick={this.writePlayerDown}>&#9660;</button>
            </div>
        )
    }
}

export default PlayerForm;