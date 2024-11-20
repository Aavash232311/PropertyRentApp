import { Component } from "react";
import AdminWrapper from "./AdminTemplate";
import "../../static/Admin/user.css";
import { IoIosArrowBack } from "react-icons/io";
import { FaCopy } from "react-icons/fa";
import Services from "../auth/uservice";
import Pagination from "../public/Useable/Pagination";

export default class AdminUserEdit extends Component {
    constructor(props: any) {
        super(props);
        this.update = this.update.bind(this);
        this.createUser = this.createUser.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.fetchUsers = this.fetchUsers.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.loadRoles = this.loadRoles.bind(this);
        this.loadRoles = this.loadRoles.bind(this);
        this.searchUser = this.searchUser.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }
    state: any = {
        Name: "",
        PhoneNumber: "",
        Email: "",
        Password: "",
        success: false,
        error: [],
        wait: false,
        user: [],
        totalPages: 1,
        viewUser: [],
        currentPage: 1,
        roles: [],
        userRoles: [],
        query: "",
        type: "id",
        copyUser: [],
        copyUserRole: [],
        UserNamePassword: "",
        CurrentPassword: "",
        NewPassword: ""
    }
    utils = new Services();
    changePassword = (ev: any) => {
        ev.preventDefault();
        fetch(`superuser/Admin/change-password`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "post",
            body: JSON.stringify(this.state)
        }).then((r) => r.json()).then((response: any) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("permissionClass");
                window.location.href = "/user-login"
                return;
            }
            const { error } = value;
            const errorList = [];
            for (let i in error) {
                const curr = error[i].error;
                errorList.push(curr);
            }
            this.setState({ error: errorList }, () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        })
    }
    fetchUsers = (page: number) => {
        const getUsers = async (page: number) => {
            await fetch(`superuser/Admin/user-all?page=${page}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.utils.getToken()}`
                },
                method: "get"
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    const { result, totalPages, roles } = value;
                    this.setState({ user: result, totalPages, userRoles: roles, copyUser: result, copyUserRole: roles });
                }
            })
        }
        getUsers(page);
    }
    componentDidMount(): void {
        this.fetchUsers(1);
        this.loadRoles();
    }
    createUser(ev: any) {
        ev.preventDefault();
        this.setState({ wait: true });
        fetch(`superuser/Admin/user-create`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "post",
            body: JSON.stringify(this.state)
        }).then(r => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                this.fetchUsers(this.state.currentPage);
                ev.target.reset();
                this.setState({ success: true, wait: false });
            } else {
                this.setState({ error: value, wait: false });
            }
        })
    }
    update(ev: any) {
        const target = ev.target;
        let { name, value }: any = target;
        if (name === "query" && value === "") {
            this.setState({ user: this.state.copyUser, userRoles: this.state.copyUserRole });
            return;
        }
        this.setState({ [name]: value });
    }
    loadRoles() {
        const fetchRoles = async () => {
            await fetch("superuser/Admin/all-roles", {
                method: "get",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.utils.getToken()}`,
                },
            })
                .then((rsp) => rsp.json())
                .then((response) => {
                    const { value, statusCode } = response;
                    if (statusCode === 200) {
                        this.setState({ roles: value });
                        return;
                    }
                    console.error("Something wront with roles")
                }).catch((r) => {
                    console.error(r);
                })
        }
        fetchRoles();
    }
    deleteUser(id: string) {
        var promprt = prompt("Do you want to delete this user yes/no:");
        if (promprt != "yes") return;
        fetch(`superuser/Admin/delete-user?id=${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode != 200) {
                this.setState({ error: value });
                return;
            }
            if (statusCode === 200) {
                this.fetchUsers(this.state.currentPage);
            }
        });
    }
    assignRole(ev: any, user: string) {
        ev.preventDefault();
        const p = prompt("Type yes to conform: ");
        if (p !== "yes") return;
        const value = ev.target.value;
        let role = value;
        fetch(`superuser/Admin/assign-roles?Role=${value}&Id=${user}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then(r => r.json()).then((response) => {
            const { statusCode } = response;
            const { value } = response;
            if (statusCode === 200) {
                // update that roles locally instead of refetching the data
                var getRoleArray = [...this.state.userRoles];
                var roleObject = getRoleArray.find(x => x.id == user);
                roleObject.name = [role];
                var updatedRoleArray = getRoleArray.filter(x => x.id != user);
                updatedRoleArray.push(roleObject);
                this.setState({ userRoles: updatedRoleArray });
                return;
            }
            const { error } = value;
            alert(error);
        });
    }
    searchUser(ev: any) {
        ev.preventDefault();
        const type = this.state.type;
        const query = this.state.query;
        fetch(`superuser/Admin/user-search-id-email?type=${type}&query=${query}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get",
        }).then((r) => r.json()).then((response) => {
            const { value, statusCode } = response;
            if (statusCode === 200) {
                const { result, roles } = value;
                this.setState({ user: [result], userRoles: roles, });
            }
        });
    }
    render() {
        const setCurrentPage = (page: number) => {
            this.fetchUsers(page);
            this.setState({ currentPage: page });
        }
        return (
            <AdminWrapper currentPage="Users">
                {this.state.viewUser.length > 0 && (
                    <div id="user-info">
                        <h6>
                            User Information
                        </h6>
                        <IoIosArrowBack onClick={() => { this.setState({ viewUser: [] }) }} />
                        <br />
                        <table className="table">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Key</th>
                                    <th scope="col">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.viewUser.map((i: any, j: number) => {
                                    return (
                                        <tr key={j}>
                                            <th scope="row">{j + 1}</th>
                                            <td>{i.key}</td>
                                            <td>{i.value}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {this.state.success && (
                    <>
                        <div className="alert alert-success" role="alert">
                            User Created
                        </div>
                    </>
                )}
                {this.state.wait === true && (
                    <div className="alert alert-success" role="alert">
                        Wait... the procress requires the server to send email
                    </div>
                )}
                {this.state.error.length > 0 ? this.state.error.map((i: any, j: number) => {
                    return (
                        <div key={j} className="alert alert-danger error-user-admin" role="alert">
                            {i.description}
                            {j === 0 ? (
                                <div onClick={() => { this.setState({ error: [] }) }} style={{ float: "right", marginRight: "15px", cursor: "pointer", userSelect: "none" }}>
                                    x
                                </div>
                            ) : null}
                        </div>
                    )
                }) : null}
                <div className="content-label-admin">
                    User Creation (You need to enter the username in place of email to login if you created user from here)
                </div>
                <form onSubmit={this.createUser} className="user-create-fourm">
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            placeholder="Enter email"
                            autoComplete="off"
                            name="Email"
                            onInput={this.update}
                        />
                        <small id="emailHelp" className="form-text text-muted">
                            No conformation email will be sent due to admin privilege
                        </small>

                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="exampleInputPassword1"
                            placeholder="Password"
                            autoComplete="off"
                            name="Password"
                            onInput={this.update}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="number">Phone number</label>
                        <input
                            type="number"
                            className="form-control"
                            id="number"
                            placeholder="977+ "
                            name="PhoneNumber"
                            onInput={this.update}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="full-name">User Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="full-name"
                            placeholder="User Name"
                            autoComplete="off"
                            name="Name"
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form>
                <br />
                <p>Staff Role is currently null and in development, person with a staff role may not be able to access certian page</p>
                <form onSubmit={this.searchUser} className="align-h-form">
                    <select name="type" value={this.state.type} onInput={this.update} className="form-control user-search">
                        <option value="id">id</option>
                        <option value="email">email</option>
                    </select>
                    <input name="query" onInput={this.update} className="form-control user-search" type="text" placeholder="search" />
                    <button type="submit" className="btn btn-primary  user-search">search</button>
                </form>
                <br />
                <div className="table-wrapper">
                    <table className="table table-user-info">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">user name</th>
                                <th scope="col">email</th>
                                <th scope="col">profile</th>
                                <th scope="col">active (email conformed)</th>
                                <th scope="col">full name</th>
                                <th scope="col">copy id</th>
                                <th scope="col">role</th>
                                <th scope="col">View more</th>
                                <th scope="col">Delete user</th>
                            </tr>
                        </thead>
                        {this.state.user.map((i: any, j: number) => {
                            // get current user roles;
                            const roleArray = [...this.state.userRoles];
                            const roles = roleArray.find(x => x.id == i.id);
                            return (
                                <tbody key={j}>
                                    <tr>
                                        <th scope="row">{j + 1}</th>
                                        <td>{i.userName}</td>
                                        <td>{i.email}</td>
                                        <td>{i.profile != "" && i.profile != null ? (
                                            <img onClick={() => {
                                                window.location.href = this.utils.normalizeImageUrl(i.profile);
                                            }} src={this.utils.normalizeImageUrl(i.profile)} height="25px" width="25px" alt="" />
                                        ) : null}</td>
                                        <td>{i.emailConfirmed === true ? "yes" : "no"}</td>
                                        <td>{i.fullName}</td>
                                        <td><FaCopy onClick={() => {
                                            window.navigator.clipboard.writeText(i.id);
                                            alert("copid !!");
                                        }} /></td>
                                        <td>
                                            <select onChange={(ev: any) => { this.assignRole(ev, i.id) }} value={roles.name[0]} className="form-control">
                                                {this.state.roles.map((i: any, j: number) => {
                                                    return (
                                                        <option value={i.name} key={j}>
                                                            {i.name}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => {
                                                const obj = i;
                                                const temp: any = [];
                                                Object.keys(obj).forEach((k: any) => {
                                                    temp.push({
                                                        key: k,
                                                        value: obj[k]
                                                    });
                                                });
                                                this.setState({ viewUser: temp });
                                            }} className="btn btn-outline-primary">view</button>
                                        </td>
                                        <td>
                                            <button onClick={() => { this.deleteUser(i.id) }} className="btn btn-outline-danger">delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            )
                        })}
                    </table>
                    <Pagination renderUpTo={10} getCurrentPage={this.state.currentPage} setCurrentPage={setCurrentPage} page={this.state.totalPages} />
                </div>
                <hr style={{ visibility: "hidden" }} />
                <form onSubmit={this.changePassword} className="user-create-fourm">
                    <div className="form-group">
                        <label htmlFor="user-name">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="user-name"
                            placeholder="User Name"
                            autoComplete="off"
                            name="UserNamePassword"
                            onInput={this.update}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="p1">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="p1"
                            placeholder="Current Password"
                            autoComplete="off"
                            name="CurrentPassword"
                            onInput={this.update}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="p2">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="p2"
                            placeholder="New Password"
                            autoComplete="off"
                            name="NewPassword"
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form>
            </AdminWrapper>
        )
    }
}