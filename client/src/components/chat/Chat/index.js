import React from "react";
import openSocket from 'socket.io-client';
import "./style.css"
import UserPanel from "../UserPanel"
import ChatWindow from "../ChatWindow"
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const socket = openSocket('http://localhost:8001');

let connected = false;
let reconnect_attempt = 0;


class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeUsers: [this.props.auth.user.name],
      messageLog: [],
      group: this.props.auth.user.group,
      userName: this.props.auth.user.name,
      userId: this.props.auth.user._id
    };
  }
  // potential needed data:
  //  groupName
  //  userName
  //  userStatus
  //  userList
  //  userStatusList
  //  message
  //  messageLog
  //  userInput

  getParticipantsMessage() {
    let message = '';
    if (this.state.activeUsers.length === 1) {
      //message += "Flying solo for now.";
    } else {
      message += "There are " + this.state.activeUsers.length + " participants";
    }
    return message;
  }

  addChatTyping() {
    // if last message is not user typing, add it
    let message = "someone is typing...";
    let ml = this.state.messageLog;
    if (ml.length === 0){
      this.setState({...this.state, messageLog: [{userName: "", message: "someone is typing..."}]})
    }
    else if (ml[ml.length-1].message !== message)
      this.setState({...this.state, messageLog: [...this.state.messageLog, {userName: "", message: message}]})
  }

  removeChatTyping() {
    // if last message is user typing, remove it
    let message = "someone is typing...";
    let ml = this.state.messageLog;
    //console.log("RM",ml)
    if (ml.length === 0){
      this.setState({...this.state, messageLog: []})
    }
    else if (ml[ml.length-1].message === message){
      this.setState({...this.state, messageLog: [...ml.slice(0,ml.length-1)]})
    }
  }

  componentDidMount() {
    // tell server we are logging in
    socket.emit('join group', this.state.group);
    socket.emit('add user', this.state.userName);

    // socket.on('connectToRoom', (data) => {
    //   console.log(data)
    //   //data = JSON.parse(data)
    //   const mes = {
    //     userName: "",
    //     message: data
    //   }
    //   //this.setState({...this.state, messageLog: [...data.messageLog, mes]});
    // })

    // set up all of the socket data receives and update the state
    socket.on("disconnecting", (data) => {
      this.setState({...this.state, messageLog: [...this.state.messageLog, {userName: "", message: "Error, disconnecting"}]});
    })

    socket.on('login', (data) => {
      // data should have active users, previous messages and we should set that to the state below
      //console.log("MSG LOG", data.messageLog)
      if (data.activeUsers)
        this.setState({...this.state, activeUsers: data.activeUsers});
      console.log("Active users", this.state.activeUsers)
      connected = true;
      // Display the welcome message
      let message = `Welcome to ${this.state.group}`;
      //let welcomeMessage = this.getParticipantsMessage();
      if (!data.messageLog){
        data.messageLog = []
      }
      this.removeChatTyping()
      //console.log("LOGGED IN") //{userName: "", message: welcomeMessage}
      this.setState({activeUsers: data.activeUsers, messageLog: [...data.messageLog, {userName: "", message: message}]});
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', (data) => {
      // should be passing object with userName and message
      data = JSON.parse(data);
      this.removeChatTyping()
      this.setState({...this.state, messageLog: [...this.state.messageLog, {userName: data.userName, message: data.message}]});
    });

    // Whenever the server emits 'user joined', log it in the chat body and update the user list
    socket.on('user joined', (data) => {
      //console.log("user joined")
      data = JSON.parse(data);
      let message = data.userName + ' joined';
      this.removeChatTyping()
      this.setState({...this.state, activeUsers: [...this.state.activeUsers, data.userName], messageLog: [...this.state.messageLog, {userName: "", message: message}]});
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {
      // TO DO: data should say who has left, and we should update the user list
      console.log("user left")
      data = JSON.parse(data);
      let message = data.userName + ' left';
      let users = this.state.activeUsers.filter(function(value){ return value !== data.userName;});
      this.removeChatTyping()
      this.setState({...this.state, activeUsers: users, messageLog: [...this.state.messageLog, {userName: "", message: message}]})
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', (userName) => {
      this.addChatTyping(userName);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', (userName) => {
      this.removeChatTyping(userName);
    });

    socket.on('disconnect', () => {
      let message = 'you have been disconnected';
      let users = this.state.activeUsers.filter(function(value){ return value !== socket.userName;});

      this.setState({...this.state, activeUsers: users, messageLog: [...this.state.messageLog, {userName: "", message: message}]})
    });

    socket.on('reconnect', (data) => {
      // pull last N messages and populate chat log (cannot just wait for new messages since we may have missed some)
      let message = 'you have been reconnected';
      reconnect_attempt = 0;
      this.setState({...this.state, messageLog: [...this.state.messageLog, {userName: "", message: message}]})
      if (this.state.userName) {
        socket.emit('add user', this.state.userName);
      }
    });

    socket.on('reconnect_error', () => {
      let message = 'attempt to reconnect has failed';
      reconnect_attempt += 1;
      if (reconnect_attempt<5)
        this.setState({...this.state, messageLog: [...this.state.messageLog, {userName: "", message: message}]})
    });

  }

  render() {
    const { user } = this.props.auth;

    return (
      <div className="App">

        <section className="pb_cover overflow-hidden cover-bg-indigo cover-bg-opacity text-left pb_gradient_v1 pb_slant-light" id="section-home">
          <div className="container">
            <div className="row align-items-center justify-content-center">
              <div className="col-12">
                <h2 className="heading mb-3">You are in CHAT_NAME</h2>
                 <div className="messaging">
                  <div className="inbox_msg">
                    <UserPanel activeUsers={this.state.activeUsers}/>
                      <div className="mesgs">
                        <ChatWindow userName={this.state.userName} connected={connected} socket={socket} messageLog={this.state.messageLog} />
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

Chat.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps
)(Chat);