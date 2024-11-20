import "../../static/login.css";
import { useState } from "react";
import signUpImage from "../../assets/signup.png";

export default function SignUp() {
    const [state, setState] = useState<{ [key: string]: any }>({ email: '', password: '' });
    const [error, setError] = useState<string[]>([]);
    const update = (ev: any) => {
        const { name, value } = ev.target;
        setState((prv) => ({ ...prv, [name]: value }))
    }
    const seeForm = (ev: any) => {
        ev.preventDefault();
        fetch("/register", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "post",
            body: JSON.stringify(state)
        }).then((rsp) => {
            console.log(rsp);
            const { status } = rsp;
            if (status === 200) {
                window.location.href = `/conform-email?email=${state.email}`;
                return;
            }
            return rsp.json();
        }).then((response) => {
            const { errors } = response;
            const err: string[] = [];
            for (let key in errors) {
                const value = errors[key][0];
                err.push(value);
            }
            setError(err);
        })
    }
    return (
        <div className="login-frame">
            <center>
                <div id="login-box">
                    <div id="signUp">
                        <div id="signupimage" style={{ backgroundImage: `url("${signUpImage}")`, overflow: "auto" }}>s</div>
                        <div>
                            <center>
                                <br />
                                <h6>
                                    Sign Up
                                </h6>
                                <hr />
                                <h2>
                                    Few Steps,
                                </h2>
                                <p>to create your account</p>
                                <form onSubmit={seeForm}>
                                    <input name="email" onInput={update} required placeholder="email" type="text" className="norm-input"></input>
                                    <br />
                                    <input name="password" onInput={update} required placeholder="password" type="password" className="norm-input"></input>
                                    <br />
                                    <br />
                                    <a style={{float: "left", marginLeft: "25px"}} href="/user-login">Already have an account?</a>
                                    <button type="submit" className="button-24 norm-input">Submit</button>
                                </form>
                            </center>
                            {error.length > 0 ? error?.map((i, j) => {
                                return (
                                    <div key={j}>
                                        <div className="alert alert-danger signUpError" role="alert">
                                            {i}
                                        </div>
                                    </div>
                                )
                            }) : null}
                        </div>
                    </div>
                </div>
            </center>
        </div>
    )
}