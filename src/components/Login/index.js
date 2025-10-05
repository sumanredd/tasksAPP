import { Component } from "react";
import "./index.css";
import { withRouter } from "../withRouter";
import Cookies from "js-cookie";
import { Link } from "react-router-dom"; 

class Login extends Component {
  state = {
    isShow: false,
    username: "",
    password: "",
    showErrorMsg: "",
  };

  handleUsername = (e) => this.setState({ username: e.target.value });
  handlePassword = (e) => this.setState({ password: e.target.value });
  toggleShowPassword = () =>
    this.setState((prev) => ({ isShow: !prev.isShow }));

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Cookies.set("jwt_token", data.token, { expires: 1 });
        this.props.navigate("/", { replace: true });
      } else {
        this.setState({ showErrorMsg: data.error_msg });
      }
    } catch (err) {
      console.error("Login failed", err);
      this.setState({ showErrorMsg: "Login failed" });
    }
  };

  componentDidMount() {

  const token = Cookies.get("jwt_token");
  const currentPath = window.location.pathname;

  if (token && currentPath === "/login") {
    this.props.navigate("/", { replace: true });
  }

}



  

  render() {
    const { isShow, showErrorMsg } = this.state;

    return (
      <div className="LoginContainer">
        <div className="LoginCard">
          <h2 className="loginLogo">FocusBoard</h2>

          <form onSubmit={this.handleSubmit}>
            <div className="UsernameContainer">
              <label htmlFor="username" className="LoginLabel">
                Username
              </label>
              <input
                id="username"
                autoComplete="off"
                type="text"
                onChange={this.handleUsername}
                className="LoginInput"
              />
            </div>

            <div>
              <label htmlFor="password" className="LoginLabel">
                Password
              </label>
              <input
                id="password"
                type={isShow ? "text" : "password"}
                onChange={this.handlePassword}
                className="LoginInput"
              />
            </div>

            <div className="showPassContainer">
              <input
                type="checkbox"
                id="showPass"
                onClick={this.toggleShowPassword}
              />
              <label htmlFor="showPass" className="showPassLabel">
                Show Password
              </label>
            </div>

            <button type="submit" className="LoginButton">
              Login
            </button>
            <p className="errorMsg">{showErrorMsg}</p>

            <p>
              Don't have an account?{" "}
              <Link to="/register" className="registerLink">
                Register
              </Link>
            </p>
          </form>

          

          
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
