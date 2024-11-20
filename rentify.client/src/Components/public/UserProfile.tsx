import { Component } from "react";
import Nav from "../nav";
import "../../static/Public/userprofie.css";
export default class UserProfile extends Component {
    constructor(props: any) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    state: any = {
        user: null,
        loading: true,
    }
    componentDidMount(): void {
        const fetchUsers = async () => {
            fetch(`api/get-particular-user?id=${this.urlParams.get("id")}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(r => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    this.setState({ loading: false, user: value });
                }
            })
        }
        fetchUsers();
    }
    queryString = window.location.search;
    urlParams = new URLSearchParams(this.queryString);
    render() {
        if (this.state.loading) return (<Nav>Loading....</Nav>)
        return (
            <Nav>
                <center>
                    <div id="user-pfofile-view">
                        <center>
                            <img height="200px" width="200px" id="img-profile" src={this.state.user.profile} alt="" />
                        </center>
                        <br />
                        <center>
                            <h6 className="h6">Bio: {this.state.user.bio}</h6>
                        </center>
                        <br />
                        <h6 className="h6">Contact Number: {this.state.user.phone}</h6>
                        <br />
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Full Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row"></th>
                                        <td>{this.state.user.email}</td>
                                        <td>{this.state.user.address}</td>
                                        <td>{this.state.user.fullName}</td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </center>
            </Nav>
        )
    }
}