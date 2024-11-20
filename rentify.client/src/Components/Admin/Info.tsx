import { Component } from "react";
import AdminWrapper from "./AdminTemplate";
import Services from "../auth/uservice";

export const CommonErrorHandeling = (response: any) => {
    const { statusCode, status } = response;
    let errors = [];
    if (statusCode === 400) {
        const { value } = response;
        errors = value;
    } else if (status === 400) {
        errors = response.errors;
    }
    const services = new Services();
    return services.dotNetCommonErrorNormalise(errors);
}
export default class Info extends Component {
    constructor(props: any) {
        super(props);
        this.update = this.update.bind(this);
        this.upload = this.upload.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    utils = new Services();
    state = {
        AboutUs: "",
        InstaGram: "",
        FaceBookPage: "",
        YoutubePage: "",
        ContactEmail: "",
        ContactPhone: "",
        error: [],
        success: false,
    };
    update(ev: any) {
        const target = ev.target;
        let { name, value }: any = target;
        this.setState({ [name]: value });
    }
    upload(ev: any) {
        ev.preventDefault();
        fetch(`superuser/Admin/add-about`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`,
            },
            method: "post",
            body: JSON.stringify(this.state)
        }).then(r => r.json()).then((response) => {
            let errors = CommonErrorHandeling(response);
            if (errors.length > 0) {
                this.setState({ error: errors });
                return;
            }
            if (response.statusCode === 200) {
                this.setState({ success: true });
                return;
            }
        });
    }
    componentDidMount(): void {
        fetch(`api/About-Site`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "get",
        }).then((r) => r.json()).then((response:any) => {
            const {statusCode, value} = response;
            if (statusCode === 200) {
                const {aboutUs, contactEmail, contactPhone, faceBookPage, instaGram, youtubePage} = value;
                this.setState({
                    AboutUs: aboutUs,
                    InstaGram: instaGram,
                    FaceBookPage: faceBookPage,
                    YoutubePage: youtubePage,
                    ContactEmail: contactEmail,
                    ContactPhone: contactPhone,
                });
            } 
        })
    }
    render() {
        return (
            <AdminWrapper currentPage={"info"}>
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
                {this.state.success ? (
                    <div className="alert alert-success error-user-admin" role="alert">
                        Uploaded!!
                        <div onClick={() => { this.setState({ success: false }) }} style={{ float: "right", marginRight: "15px", cursor: "pointer", userSelect: "none" }}>
                            x
                        </div>
                    </div>
                ) : null}
                <form onSubmit={this.upload} className="user-create-fourm">
                    <h6 className="h6">site information</h6>
                    <div className="form-group">
                        <textarea
                            className="form-control"
                            placeholder="about"
                            name="AboutUs"
                            required
                            defaultValue={this.state.AboutUs}
                            onInput={this.update}
                        />
                        <small id="emailHelp" className="form-text text-muted">
                            This information will be displayed in about page
                        </small>
                    </div>
                    <br />
                    <h6 className="h6">Social Links</h6>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="instagram"
                            name="InstaGram"
                            defaultValue={this.state.InstaGram}
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="facebook"
                            name="FaceBookPage"
                            defaultValue={this.state.FaceBookPage}
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="youtube"
                            name="YoutubePage"
                            defaultValue={this.state.YoutubePage}
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="contact email"
                            type="email"
                            name="ContactEmail"
                            defaultValue={this.state.ContactEmail}
                            required
                            onInput={this.update}
                        />
                    </div>
                    <br />
                    <h6 className="h6">contact number</h6>
                    <div className="form-group">
                        <input
                            className="form-control"
                            placeholder="977+"
                            type="number"
                            name="ContactPhone"
                            defaultValue={this.state.ContactPhone}
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