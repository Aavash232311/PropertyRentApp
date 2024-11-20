import React from "react";
import AuthContext, { AuthProvider } from "./auth";

export default class Login extends React.Component {
    constructor(props: any) {
        super(props);
    }
    state = {
        error: false,
    }
    render() {
        return (
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value: any) => {
                        const handleSubmit = (event: any) => {
                            event.preventDefault();
                            const data = new FormData(event.currentTarget);
                            const username = data.get("email");
                            const password = data.get("password");
                            if (username !== "" && password !== "") {
                                value.logIn(username, password).then((rsp: any) => {
                                    if (rsp !== true) {
                                        this.setState({ error: true });
                                    } else {
                                        setTimeout(() => {
                                            window.location.href = "/";
                                        }, 500)
                                    }
                                });
                            }
                        };
                        return (
                            <div className="login-frame">
                                <center>
                                    <div id="lgn-frame">
                                        <br />
                                        <center>
                                            <h3>
                                                Login
                                            </h3>
                                        </center>
                                        <hr />
                                        <form onSubmit={handleSubmit} >
                                            <input name="email" required placeholder="email" type="text" className="norm-input"></input>
                                            <br />
                                            <input name="password" required placeholder="password" type="password" className="norm-input"></input>
                                            <br /> <br />
                                            <a className="a-align-lgn"  href="/signup-user">Don't have an account?</a> <br />
                                            <a className="a-align-lgn"  href="/forgot-password">Forgot password?</a>
                                            {this.state.error === true ? (
                                                <div>
                                                    <br />
                                                    <div className="alert alert-danger signUpError" role="alert">
                                                        Username or password incorrect {":("}
                                                    </div>
                                                </div>
                                            ) : null}
                                            <button type="submit" className="button-24 norm-input">Login</button>
                                        </form>
                                    </div>
                                </center>
                            </div>
                        )
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        )
    }
}