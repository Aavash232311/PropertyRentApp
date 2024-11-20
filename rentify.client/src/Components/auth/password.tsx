import { Component } from "react";
import "../../static/password.css";
import Nav from "../nav";
export default class ForgotPassword extends Component {
    constructor(props: any) {
        super(props);
    }
    state: any = {
        email: "",
        timer: 0,
        suceess: false,
        resetCode: "",
        newPassword: "",
        errors: [],
    }
    submit = (ev: any) => {
        ev.preventDefault();
        const Interval = setInterval(() => { this.setState({ timer: this.state.timer + 1 }) }, 1000)
        fetch(`/forgotPassword`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(this.state)
        }).then((response: any) => {
            const { status } = response;
            if (status === 200) {
                alert("Conformation has been sent");
                clearInterval(Interval);
                this.setState({ timer: 0, suceess: true, email: "" });
            }
        }).catch((error) => {
            console.log("Error: ", error);
        })
    }
    resetPassword = (ev: any) => {
        ev.preventDefault();
        fetch(`/resetPassword`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(this.state)
        }).then((response: any) => {
            console.log(response);
            const { status } = response;
            if (status != 200) {
                return response.json();
            }else {
                window.location.href = "/user-login"
            }
        }).then((r) => {
            const { statusCode } = r;
            if (statusCode != 200) {
                const errors: any = r.errors;
                const err: string[] = [];
                for (let key in errors) {
                    const value = errors[key][0];
                    err.push(value);
                }
                this.setState({ errors: err });
                return;
            }
        })
    }
    render() {
        return (
            <Nav>
                <center>
                    <div id="forgot-password-frame">
                        {this.state.suceess === false && (
                            <>
                                <br />
                                <form onSubmit={this.submit}>
                                    <center>
                                        <h5>
                                            Change Password
                                        </h5> <hr />
                                        <p>Please Enter your email address </p> <br />
                                        {this.state.timer != 0 ? <p>Email will be sent {this.state.timer}</p> : null}
                                        <input required onInput={(ev: any) => { this.setState({ email: ev.target.value }) }} placeholder="email" name="email" type="email" className="input-forgot-password form-control" /> <br />
                                        <button type="submit" className="btn btn-success input-forgot-password">Next..</button>
                                    </center>
                                </form>
                            </>
                        )}
                        {this.state.suceess === true && (
                            <>
                                <br />
                                <center>
                                    <h5 className="h5">
                                        Enter the alphanumeric code:
                                    </h5> <hr />
                                    <form onSubmit={this.resetPassword}>
                                        <input required onInput={(ev: any) => { this.setState({ email: ev.target.value }) }}
                                            placeholder="email" autoComplete={"off"} type="email" className="input-forgot-password form-control" /> <br />
                                        <input required onInput={(ev: any) => { this.setState({ resetCode: ev.target.value }) }}
                                            placeholder="code.." autoComplete="off" type="text" className="input-forgot-password form-control" /> <br />
                                        <input required onInput={(ev: any) => { this.setState({ newPassword: ev.target.value }) }}
                                            placeholder="new password" autoComplete="off" type="password" className="input-forgot-password form-control" /> <br />
                                        {this.state.errors.length > 0 ? (
                                            <>
                                                <ul>
                                                    {
                                                        this.state.errors?.map((i: any, j: number) => {
                                                            return (
                                                                <li key={j} className=" forgot-password-error">
                                                                    {i}
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </>
                                        ) : null}
                                        <button type="submit" className="btn btn-success input-forgot-password">Reset..</button>
                                        <hr style={{ visibility: "hidden" }} />
                                    </form>
                                </center>
                            </>
                        )}
                    </div>
                </center>
            </Nav>
        )
    }
}