import React, { Component } from "react";
import AdminWrapper from "./AdminTemplate";
import "../../static/Admin/highlight.css";
import Services from "../auth/uservice";
import Pagination from "../public/Useable/Pagination";
import { MdDeleteOutline } from "react-icons/md";
import { FaLink } from "react-icons/fa";

export class HighlightProperty extends Component {
    state = {
        searchby: "label",
        property: [],
        loading: true,
        query: "",
        page: 1,
        initial: [],
        currentPage: 1,
        themeName: "",
        loadedThemes: []
    }
    utils = new Services();
    constructor(props: any) {
        super(props);
        this.search = this.search.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.fetchInitial = this.fetchInitial.bind(this);
        this.update = this.update.bind(this);
        this.searchProperty = this.searchProperty.bind(this);
        this.createTheme = this.createTheme.bind(this);
        this.LoadThems = this.LoadThems.bind(this);
        this.AddToHighlight = this.AddToHighlight.bind(this);
        this.RemoveFromHighlight = this.RemoveFromHighlight.bind(this);
        this.DeleteHighlight = this.DeleteHighlight.bind(this);
        this.deleteProperty = this.deleteProperty.bind(this);
    }
    async fetchInitial() {
        try {
            const response = await fetch('api/get-recent-property', {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            this.setState({ property: data.value, loading: false, initial: data.value });
        } catch (error) {
            this.setState({ error, loading: false });
        }
    }
    async componentDidMount() {

        const fetchAll = async () => {
            try {
                await Promise.all([this.fetchInitial(), this.LoadThems()]);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                this.setState({ loading: false });
            }
        };

        fetchAll();
    }
    update(ev: any) {
        if (ev.target.name === "query") {
            if (ev.target.value === "") {
                this.setState({ property: this.state.initial, page: 1 });
            }
        }
        this.setState({ [ev.target.name]: ev.target.value });
    }
    async search(ev: any) {
        ev.preventDefault();
        this.searchProperty(this.state.searchby, this.state.query, this.state.page)
    }
    async searchProperty(searchBy: string, query: string, page: number) {
        await fetch(`superuser/Admin/admin-search-property?searchBy=${searchBy}&query=${query}&page=${page}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                let { property, totalPage } = value;
                if (this.state.searchby === "id") {
                    this.setState({ property: [property], page: 1 });
                    return;
                }
                if (property.length < 5) {
                    totalPage = 1;
                }
                this.setState({ property, page: totalPage });
            }
        })
    }
    async createTheme(ev: any) {
        ev.preventDefault();
        const name = this.state.themeName;
        await fetch(`superuser/Admin/create-theme?name=${name}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                ev.target.reset();
                this.LoadThems();
            }
        })
    }

    async LoadThems() {
        await fetch(`api/get-themes-admin-home`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                this.setState({ loadedThemes: value });
            }
        })
    }
    AddToHighlight(ev: any, productId: string) {
        let uri = `superuser/Admin/addToHighLight?propertyId=${productId}&highLightId=${ev.target.value}`
        if (ev.target.value === "") {
            uri = `superuser/Admin/addToHighLight?propertyId=${productId}`
        }
        fetch(uri, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                this.LoadThems();
            }
        })
    }
    RemoveFromHighlight(id: string) {
        fetch(`superuser/Admin/remove-from-highlight?propertyId=${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                this.LoadThems();
            }
        })
    }

    DeleteHighlight(id: string) {
        fetch(`superuser/Admin/delete-highlgiht?highlightId=${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                this.LoadThems();
            }
        });
    }

    deleteProperty(id: string) {
        const p = prompt("Type yes to delete: ");
        if (p != "yes") return;
        fetch(`superuser/Admin/property-delete-admin?id=${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                const getCurrent: any = [...this.state.property];
                const filter = getCurrent.filter((x: any) => x.id != id);
                // lets remove from initial fetch array as well
                const initial: any = [...this.state.initial];
                const initialFilter = initial.filter((x: any) => x.id != id);
                this.setState({ property: filter, initial: initialFilter });
            }
        })
    }

    render() {
        if (this.state.loading) return <div>Loading...</div>;
        const setCurrentPage = (page: number) => {
            this.setState({ currentPage: page })
            this.searchProperty(this.state.searchby, this.state.query, page);
        }
        return (
            <AdminWrapper currentPage={"Highlights"}>
                <div className="content-label-admin">
                    Highlight property that you want to make it appear in home page
                </div>
                <form onSubmit={this.search} id="filter-admin-highlight" className="p-3 mb-2 bg-light text-dark">
                    <div>
                        <select onInput={(ev: any) => { this.setState({ searchby: ev.target.value }) }} className="highlight-input-table" >
                            <option value="label">label</option>
                            <option value="id">id</option>
                        </select>
                    </div>
                    <div>
                        <input autoComplete="off" name="query" onInput={this.update} required className="highlight-input-table" type="text" placeholder={this.state.searchby}></input>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-outline-primary highlight-input-table">Search</button>
                    </div>
                </form>
                <div className="table-wrapper">
                    <table className="table">
                        <caption>
                            {this.state.page !== 1 ? (
                                <>
                                    <Pagination renderUpTo={5} getCurrentPage={this.state.currentPage} setCurrentPage={setCurrentPage} page={this.state.page} />
                                </>
                            ) : null}
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Label/Name</th>
                                <th scope="col">Property Id</th>
                                <th scope="col">Image</th>
                                <th scope="col">Highlight themes</th>
                                <th scope="col">View</th>
                                <th scope="col">DELETE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.property.map((i: any, j: number) => {
                                // WHEN HIGHLIGHTING WE NEED TO CHECK FOR DEFAULT VALUE AND HIGHLIGHT IT
                                // IF THE USER SELECTS NULL THEN WE NEED TO REMOVE FROM HIGHLIGHT
                                const loadTheme = [...this.state.loadedThemes];
                                let defaultSelect = "";
                                for (let themes in loadTheme) {
                                    const { properties, id }: any = loadTheme[themes];
                                    const check = properties.find((x: any) => x.id === i.id);
                                    if (check != undefined) {
                                        defaultSelect = id;
                                        break;
                                    }
                                }
                                return (
                                    <React.Fragment key={j}>
                                        <tr>
                                            <th scope="row">{j + 1}</th>
                                            <td>{i.name}</td>
                                            <td>{i.id}</td>
                                            <td>
                                                <img height="50px" width="50px" src={i.image_1}></img>
                                            </td>
                                            <td>
                                                <select value={defaultSelect} onInput={(ev) => { this.AddToHighlight(ev, i.id) }} name="">
                                                    <option value=""></option>
                                                    {this.state.loadedThemes.map((k: any, l: number) => {
                                                        return (
                                                            <React.Fragment key={l}>
                                                                <option value={k.id}>{k.label}</option>
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </select>
                                            </td>
                                            <td>
                                                <a target="_blank" href={`property-view?id=${i.id}`}><FaLink/></a>
                                            </td>
                                            <td>
                                                <button onClick={() => { this.deleteProperty(i.id) }} className="btn btn-outline-danger btn-sm">DELETE</button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="content-label-admin">
                    Create themes ex: featured, highlighted, special: and you can selected listed product from above which will be listed then
                </div>
                <form onSubmit={this.createTheme} id="create-theme">
                    <div>
                        <input name="themeName" onInput={this.update} placeholder="name..." className="form-control"></input>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-outline-primary btn-sm">create</button>
                    </div>
                </form>
                {this.state.loadedThemes.length != 0 ? (
                    <>
                        <div className="content-label-admin">
                            Create themes
                        </div>
                        <ul className="list-group" id="highlight-list">
                            {this.state.loadedThemes.map((i: any, j: number) => {
                                const property = i.properties;
                                return (
                                    <React.Fragment key={j}>
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            {i.label}
                                            <div>
                                                <MdDeleteOutline onClick={() => { this.DeleteHighlight(i.id) }} />
                                            </div>
                                        </li>
                                        {property.map((k: any, l: number) => {
                                            return (
                                                <React.Fragment key={l}>
                                                    <li className="list-group-item d-flex justify-content-between align-items-center active">
                                                        {k.name}
                                                        <MdDeleteOutline onClick={() => { this.RemoveFromHighlight(k.id) }} />
                                                    </li>
                                                </React.Fragment>
                                            )
                                        })}
                                    </React.Fragment>
                                )
                            })}
                        </ul>
                    </>
                ) : null}
            </AdminWrapper>
        )
    }
}