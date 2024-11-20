import React, { Component } from 'react';
import "../../static/profile.css";
import Services from './uservice';
import { FaRegUserCircle } from "react-icons/fa";
import PropertyNav from '../public/addProperty';

export default class Profile extends Component {
    state = {
        Bio: "",
        previewProfile: "",
        FullName: "",
        Addres: "",
        OfficeAddress: "",
        Phone: "",
        error: [],
        isLayoutReady: false,
    }
    utils = new Services();
    constructor(props: any) {
        super(props);
        this.update = this.update.bind(this);
        this.upload = this.upload.bind(this);
        this.populate = this.populate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    componentDidMount(): void {
        this.populate();
        this.setState({ isLayoutReady: true });
    }
    populate = async () => {
        try {
            const userData = await this.utils.getUser();
            const { value, statusCode } = userData;
            if (statusCode !== 200) return;
            // let's get values that we want to set the state of
            const { bio, address, offieAddress, fullName, profile, phone } = value;
            this.setState({
                Bio: bio,
                previewProfile: this.utils.normalizeImageUrl(profile),
                FullName: fullName,
                Addres: address,
                OfficeAddress: offieAddress,
                Phone: phone
            }, () => { });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    update(ev: any) {
        let { value, name } = ev.target;
        this.setState({ [name]: value });
    }
    upload(ev: any) {
        ev.preventDefault();
        const formData = new FormData();
        const state: any = this.state;
        for (let i in state) {
            formData.append(i, state[i]);
        }
        fetch("api/user-update", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${this.utils.getToken()}`,
            },
            body: formData
        }).then((rsp) => rsp.json()).then((response) => {
            const { statusCode, status } = response;
            if (statusCode === 200) {
                this.setState({ error: [] });
                alert("Uploaded");
                return;
            }
            if (statusCode === 400 || status === 400) {
                const { errors } = statusCode === 400 ? response.value : response;
                const err = [];
                for (let i in errors) {
                    const errorList = errors[i];
                    // one field can have multiple erros so
                    for (let j in errorList) {
                        err.push({
                            description: errorList[j]
                        });
                    }
                }
                this.setState({ error: err });
            }
        })
    }
    render(): React.ReactNode {
        const profilePreview = (ev: any) => {
            const query: HTMLInputElement | null = document.querySelector("#profile-picture-frame");
            if (query === null) return;
            query.style.backgroundImage = `url("${URL.createObjectURL(ev.target.files[0])}")`;
            this.setState({ [ev.target.name]: ev.target.files[0] });
        }
        return (
            <PropertyNav>
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
                <center>
                    <div id="profile-frame">
                        <div id="table-header" className="p-3 mb-2 bg-dark text-white">
                            User profile
                        </div>
                        <form onSubmit={this.upload}>
                            <div id="profile-picture-frame" style={{ backgroundImage: `url("${this.state.previewProfile}")` }}>
                                <label htmlFor='Profile'>
                                    <FaRegUserCircle />
                                </label>
                                <input onInput={(ev) => { profilePreview(ev), this.update }} style={{ display: "none" }} name='Profile' id="Profile" type='file' accept="image/*"></input>
                            </div>
                            <br />
                            <div className="mid-input">
                                <input onInput={this.update} defaultValue={this.state.FullName} required type="text" name='FullName' placeholder='Full Name' className="form-control" />
                            </div>
                            <div className="mid-input">
                                <input onInput={this.update} defaultValue={this.state.Addres} required type="text" name='Addres' placeholder='Home Addres' className="form-control" />
                            </div>
                            <div className="mid-input">
                                <input onInput={this.update} defaultValue={this.state.Phone} required type="number" name='Phone' placeholder='977+' className="form-control" />
                            </div>
                            <div className="mid-input">
                                <input onInput={this.update} defaultValue={this.state.OfficeAddress} type="text" name='OfficeAddress' placeholder='Office Addres (optional)' className="form-control" />
                            </div>
                            <div className="mid-input">
                                <textarea onInput={this.update} defaultValue={this.state.Bio !== "null" ? this.state.Bio : ""} name='Bio' placeholder='Bio.. information or additional contact number' className="form-control" />
                            </div>
                            <div className="mid-input">
                                <button type='submit' className='btn btn-primary'>upload</button>
                            </div>
                        </form>
                    </div>
                </center>
            </PropertyNav>
        )
    }
}