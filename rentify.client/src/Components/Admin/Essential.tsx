import { Component } from "react";
import AdminWrapper from "./AdminTemplate";
import Services from "../auth/uservice";
import "../../static/Admin/essential.css";

export default class AdminEssential extends Component {
    state = {
        type: "",
        saveType: [],
        homeImage: "",
        savedHomeImage: "",
    }
    utils = new Services();
    constructor(props: any) {
        super(props);
        this.update = this.update.bind(this);
        this.uploadType = this.uploadType.bind(this);
        this.getTypeOfPropery = this.getTypeOfPropery.bind(this);
        this.displayProperty = this.displayProperty.bind(this);
        this.getTypeOfPropery = this.getTypeOfPropery.bind(this);
        this.uploadHomeImage = this.uploadHomeImage.bind(this);
        this.getThemedImages = this.getThemedImages.bind(this);
    }
    update(ev: any) {
        const target = ev.target;
        let { name, value, type }: any = target;
        if (type === "file") {
            this.setState({ [name]: ev.target.files[0] });
            return;
        }
        this.setState({ [name]: value });
    }
    uploadType(ev: any) {
        ev.preventDefault();
        const value = this.state.type;
        fetch(`superuser/Admin/set-property-type?Name=${value}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                ev.target.reset();
                this.getTypeOfPropery();
            }
        })
    }
    getTypeOfPropery() {
        fetch("api/get-type-property", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                this.setState({ saveType: value });
            }
        })
    }
    displayProperty(condition: boolean, id: string) {
        fetch(`superuser/Admin/display-property-home?condition=${condition}&id=${id}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                this.getTypeOfPropery();
            }
        })
    }
    deleteTypeProperty(id: string) {
        fetch(`superuser/Admin/del-type-property?id=${id}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
                this.getTypeOfPropery();
            }
        })
    }
    componentDidMount(): void {
        this.getTypeOfPropery();
        this.getThemedImages();
    }
    uploadHomeImage(ev: any) {
        ev.preventDefault();
        const formData = new FormData();
        if (this.state.homeImage === null) return;
        formData.append("Image", this.state.homeImage);
        fetch(`superuser/Admin/upload-home-page-theme-image`, {
            headers: {
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "post",
            body: formData
        }).then(r => r.json()).then((response) => {
            const {statusCode} = response;
            if (statusCode === 200) {
                this.getThemedImages();
            }
        })
    }
    getThemedImages() {
        fetch("api/get-themed-image", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((r) => r.json()).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                this.setState({savedHomeImage: value.image});
            }
        })
    }
    render() {
        return (
            <>
                <AdminWrapper currentPage={"Essential"}>
                    <div className="content-label-admin">
                        Add category of real state
                    </div>
                    <form id="add-category-of-state-admin" onSubmit={this.uploadType}>
                        <input autoComplete="off" onInput={this.update} name="type" className="form-control" placeholder="type?"></input>
                        <button type="submit" className="btn btn-outline-primary">add</button>
                    </form>
                    <div className="content-label-admin">
                        Category of real state
                    </div>
                    <table className="table" id="categoty-table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Category</th>
                                <th scope="col">Display</th>
                                <th scope="col">Action</th>
                                <th scope="col">Show home page</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.saveType.map((i: any, j) => {
                                return (
                                    <tr key={j}>
                                        <th >{j}</th>
                                        <td>{i.name}</td>
                                        <td>{i.showFrontPage === true ? "yes" : "no"}</td>
                                        <td>
                                            <button onClick={() => { this.deleteTypeProperty(i.id) }} className="btn btn-outline-danger btn-sm">
                                                Delete
                                            </button>
                                        </td>
                                        <td>
                                            {i.showFrontPage === true ? <button onClick={() => { this.displayProperty(false, i.id) }} className="btn btn-outline-primary btn-sm">Hide</button> : <button onClick={() => { this.displayProperty(true, i.id) }} className="btn btn-outline-primary btn-sm">Show</button>}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div className="content-label-admin">
                        Theme Images (Home Page)
                    </div>
                    <form onSubmit={this.uploadHomeImage}>
                        <input accept="image/*" onInput={this.update} name="homeImage" className="form-control admin-form-essential" type="file"></input>
                        <button type="submit" className="btn btn-outline-primary admin-form-essential">Submit</button>
                    </form>
                    {this.state.savedHomeImage !== null ? <a href={this.state.savedHomeImage} target="_blank" >See Saved Image?</a> : null}
                </AdminWrapper>
            </>
        )
    }
}