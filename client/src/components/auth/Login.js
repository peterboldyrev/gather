import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loginUser } from '../../actions/authActions';
import classnames from 'classnames';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {}
    }
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      // Push user to dashboard when they login...
      this.props.history.push("/dashboard");
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  handleChange = event => {
    this.setState({ [event.target.id]: event.target.value });
  }

  handleSubmit = event => {
    event.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password,
    }

    this.props.loginUser(userData);
  }

  render() {
    const { errors } = this.state;

    return (
      <div>

<form action="#" className="bg-white rounded pb_form_v1">
              <h2 className="mb-4 mt-0 text-center">Sign Up for Free</h2>
              
              <div className="form-group">
                <input type="text" className="form-control pb_height-50 reverse" placeholder="Full name"/>
              </div>
              <div className="form-group">
                <input type="text" className="form-control pb_height-50 reverse" placeholder="Email"/>
              </div>
              <div className="form-group">
                <input type="password" className="form-control pb_height-50 reverse" placeholder="Password"/>
              </div>
              <div className="form-group">
                <input type="password" className="form-control pb_height-50 reverse" placeholder="Confirm password"/>
              </div>
             
              <div className="form-group">
                <input type="submit" className="btn btn-primary btn-lg btn-block pb_btn-pill  btn-shadow-blue" value="Register"/>
              </div>
        </form>
        
        <Link to="/">Back to Landing</Link>
        <p>Don't have an account?<Link to="/register">Register</Link></p>
        <form noValidate onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={this.handleChange}
              value={this.state.email}
              error={errors.email}
              id="email"
              type="email"
              className={classnames('form-control pb_height-50 reverse', {
                invalid: errors.email || errors.emailnotfound
              })}
            />
             <span style={{color: 'red'}}>{errors.email}{errors.emailnotfound}</span>
                </div>
              <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
              onChange={this.handleChange}
              value={this.state.password}
              error={errors.password}
              id="password"
              type="password"
              className={classnames('form-control pb_height-50 reverse', {
                invalid: errors.password || errors.passwordincorrect
              })}
            />
            <span style={{color: 'red'}}>{errors.password}{errors.passwordincorrect}</span>
          </div>
               
             
              <div className="form-group">
              <button type="submit" className="btn btn-primary btn-lg btn-block pb_btn-pill  btn-shadow-blue">Login</button>

              </div>
            </form>

          </div>
       
 




  
     
    )
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { loginUser }
)(Login);