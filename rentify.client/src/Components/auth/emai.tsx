import React from 'react'
import "../../static/email.css";
import Nav from '../nav';
export default class EmailConform extends React.Component {
    constructor(props: any) {
        super(props);
        this.resendConformationLink = this.resendConformationLink.bind(this);
    }
    searchParams = new URLSearchParams(window.location.search);
    email = this.searchParams.get("email");
    state = {
        timer: 0
    }
    resendConformationLink(ev: any) {
        ev.preventDefault();
        const Interval =  setInterval(() => { this.setState({timer: this.state.timer + 1}) }, 1000)
        fetch(`/resendConfirmationEmail`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify({
                email: this.email
            })
        }).then((r) => {
            const {status} = r;
            if (status === 200) {
                alert("Conformation has been sent");
                clearInterval(Interval);
                this.setState({timer: 0});
            }
        })
    }
    render() {
        return (
            <Nav>
                <div id="email-frame">
                    <center>
                        <div id="conform-email-box"> <br />
                            <center>
                                <h5>
                                    Email Conformation
                                </h5>
                            </center>
                            <hr />
                            <p>
                                An Email has been sent to <b>{this.email}</b>. Please confirm your account by clicking the link. {this.state.timer !== 0 ? `${this.state.timer} s` : null} <br />
                            </p>
                            <a onClick={this.resendConformationLink} href="">Resend conformation link?</a>
                            <br /> <br />
                            <a href="/user-login">Login</a>
                        </div>
                    </center>
                </div>
            </Nav>
        )
    }

}