import { Component } from "react";
import "./index.css";
import { withRouter } from "../../withRouter";

class Register extends Component {
  state = {
    isShow: false,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    showErrorMsg: "",
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onShowPassword = () => {
    this.setState((prev) => ({ isShow: !prev.isShow }));
  };

  validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  validatePassword = (password) => {
    // Min 6 chars, at least 1 number, 1 special char
    const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
    return re.test(password);
  };

  onSubmitEvent = async (event) => {
    event.preventDefault();
    const { username, email, password, confirmPassword } = this.state;

    if (!username || !email || !password || !confirmPassword) {
      this.setState({ showErrorMsg: "All fields are required" });
      return;
    }

 

    if (!this.validatePassword(password)) {
      this.setState({
        showErrorMsg:
          "Password must be at least 6 chars, include 1 number and 1 special character",
      });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ showErrorMsg: "Passwords do not match" });
      return;
    }

    // --- Submit ---
    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration successful! Please login now.");
        this.props.navigate("/login", { replace: true });
      } else {
        this.setState({ showErrorMsg: data.error_msg || "Registration failed" });
      }
    } catch (err) {
      console.error("Register failed:", err);
      this.setState({ showErrorMsg: "Something went wrong. Try again." });
    }
  };

  render() {
    const { isShow, showErrorMsg } = this.state;

    return (
      <div className="LoginContainer">
        <div className="LoginCard">
          <h2 className="loginLogo">Register</h2>

          <form onSubmit={this.onSubmitEvent}>
            <div className="UsernameContainer">
              <label htmlFor="username" className="LoginLabel">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="off"
                required
                onChange={this.handleChange}
                className="LoginInput"
              />
            </div>

            <div className="UsernameContainer">
              <label htmlFor="email" className="LoginLabel">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="off"
                required
                onChange={this.handleChange}
                className="LoginInput"
              />
            </div>

            <div>
              <label htmlFor="password" className="LoginLabel">Password</label>
              <input
                type={isShow ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="off"
                required
                onChange={this.handleChange}
                className="LoginInput"
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label htmlFor="confirmPassword" className="LoginLabel">Confirm Password</label>
              <input
                type={isShow ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="off"
                required
                onChange={this.handleChange}
                className="LoginInput"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
              <input id="showPass" type="checkbox" onClick={this.onShowPassword} />
              <label htmlFor="showPass" className="showPassLabel">Show Password</label>
            </div>

            <div>
              <button type="submit" className="LoginButton">Register</button>
              <p className="errorMsg">{showErrorMsg}</p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(Register);
