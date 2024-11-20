import React, { Component } from "react";
import AdminWrapper from "./AdminTemplate";
import Services from "../auth/uservice";
import Pagination from "../public/Useable/Pagination";
import { MdDelete } from "react-icons/md";

export default class AdminLogs extends Component {
    constructor(props: any) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.fetchLogs = this.fetchLogs.bind(this);
        this.clearLogs = this.clearLogs.bind(this);
        this.superusers = this.superusers.bind(this);
        this.update = this.update.bind(this);
    }
    state = {
        loading: false,
        currentPage: 1,
        totalPages: 1,
        Logs: [],
        date: "",
        user: [],
        selectedUser: "all"
    }
    utils = new Services();
    update(ev: any) {
        this.setState({ [ev.target.name]: ev.target.value }, () => {
            if (ev.target.name === "selectedUser") {
                // THE STATE ONLY GETS TRIGGERED WHEN RENDERING PAGINATION
                // ONLY IF this.state.Logs.length > 0, when re triggering the length is
                // already grater than 0, so it does not changes
                this.setState({ Logs: [] }, () => {
                    this.fetchLogs(1);
                });
            }else if (ev.target.name == "date") {
                this.setState({ Logs: [] }, () => {
                    this.fetchLogs(1);
                });
            }
        });
    }
    fetchLogs = (number: number) => {
        const fetchReport = async (page: number) => {
            await fetch(`superuser/Admin/get-logs?page=${page}&user=${this.state.selectedUser}&date=${this.state.date}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.utils.getToken()}`
                }
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    const { result, totalPages } = value;
                    this.setState({ Logs: result, loading: false, totalPages })
                }
            })
        }
        fetchReport(number);
    }
    superusers = () => {
        fetch(`superuser/Admin/get-admin-users`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                const userEmails = [];
                if ((value.length > 0)) {
                    for (let i in value) {
                        userEmails.push(value[i].userName);
                    }
                    this.setState({ user: userEmails });
                }
            }
        })
    }
    componentDidMount() {
        this.fetchLogs(1);
        this.superusers();
    }
    clearLogs() {
        const promp = confirm("Are you sure you want to clear logs: ");
        if (!promp) return;
        fetch(`superuser/Admin/clear-logs`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((res: any) => {
            const { statusCode } = res;
            if (statusCode === 200) {
                this.fetchLogs(1);
                return;
            }
            else if (statusCode === 404) {
                alert("No User");
                return;
            } else {
                alert("Permission denied");
            }
        });
    }
    render() {
        if (this.state.loading === true) return "loading";
        const setCurrentPage = (page: number) => {
            this.fetchLogs(page);
            this.setState({ currentPage: page });
        }
        return (
            <AdminWrapper currentPage="Admin logs">
                <form id="filter-admin-highlight" className="p-3 mb-2 bg-light text-dark">
                    <div>
                        <select value={this.state.selectedUser} name="selectedUser" onInput={this.update} className="highlight-input-table form-control" >
                            <option value="all">All</option>
                            {this.state.user.map((i: any, j) => {
                                return (
                                    <React.Fragment key={j}>
                                        <option value={i}>{i}</option>
                                    </React.Fragment>
                                )
                            })}
                        </select>
                    </div>
                    <div>
                        <input name="date" onInput={this.update} type="date" className="form-control" />
                    </div>
                    <div>
                        <button id="clear-logs" onClick={this.clearLogs} className="btn btn-danger">
                            <MdDelete />
                        </button>
                        <label htmlFor="clear-logs" style={{ fontSize: "12px" }}>
                            <b>Clear Logs</b>
                        </label>
                    </div>
                </form>

                {this.state.Logs.length > 0 && (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">User</th>
                                    <th scope="col">Action</th>
                                    <th scope="col">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.Logs.map((i: any, j) => {
                                    return (
                                        <tr key={j}>
                                            <th scope="row">{j + 1}</th>
                                            <td>
                                                <div>
                                                    <b>{i.userName}</b>
                                                </div>
                                            </td>
                                            <td>{i.log}</td>
                                            <td>{this.utils.formatDate(i.actionDate)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <Pagination renderUpTo={10} getCurrentPage={this.state.currentPage} setCurrentPage={setCurrentPage} page={this.state.totalPages} />
                    </div>
                )}
            </AdminWrapper>
        )
    }
}