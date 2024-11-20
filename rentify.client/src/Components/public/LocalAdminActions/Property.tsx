import React, { Component, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Import Leaflet icons
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { FaPhotoVideo } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "../../../static/property.css";
import Pagination from '../Useable/Pagination';
import Services from '../../auth/uservice';
import PropertyNav from '../addProperty';
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import ConformationDialoge from '../Useable/Conformation';

export const defaultIcon = new L.Icon({
    iconUrl: markerIconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadowUrl,
    shadowSize: [41, 41],
});

const LocationMarker: React.FC<{ position: [number, number] }> = ({ position }) => {
    return (
        <Marker position={position} icon={defaultIcon}>
            <Popup>
                Selected Location: <br /> Latitude: {position[0]} <br /> Longitude: {position[1]}
            </Popup>
        </Marker>
    );
};

interface MapComponentProps {
    parentFunction: (arr: any) => void;
    localizeILS: [number, number],
}

export const MapComponent: React.FC<MapComponentProps> = ({ parentFunction, localizeILS }) => {
    const [position, setPosition] = useState<[number, number]>(localizeILS);
    const [count, setCount] = useState<number>(0);
    useEffect(() => {
        if (count === 0) {
            setPosition(localizeILS); // for the initial plot
        }
    });

    const MapEvents = () => {
        useMapEvents({
            click(event) {
                let c = count + 1;
                setCount(c);
                const { lat, lng } = event.latlng;
                setPosition([lat, lng]);
                parentFunction([lat, lng]);
            },
        });
        return null;
    };

    return (
        <MapContainer center={position} style={{ width: "100%", height: "250px" }} zoom={14} className='render-map-full'>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <LocationMarker position={position} />}
            <MapEvents />
        </MapContainer>
    );
};
export const NormalizedBooleasn: any = {  // if any update in future make sure to add here
    hotWatter: "Hot water",
    waterAllTime: "Water all time",
    accessToRoof: "Access to the roof",
    carParking: "Car parking",
    allowanceOfPet: "Pet allowed",
    preFurnished: "Pre furnished",
    accessToNaturalSun: "Access to natural sun",
    storageFacility: "Storage facility",
}
export class AddProperty extends Component<PropertyNavigateBack> {
    constructor(props: any) {
        super(props);
        this.upload = this.upload.bind(this);
        this.update = this.update.bind(this);
    }
    inj: any = this.props.inject;
    componentDidMount(): void {
        console.log(this.props);
        if (this.inj !== null) {
            // we are using compoenent to update;

            Array.from({ length: this.range }, (_, index) => index + 1).map((number) => {
                const injectImageURL = this.inj[`image_${number}`]
                if (injectImageURL !== null || injectImageURL !== "") {
                    const currFrame: any = document.getElementsByClassName(`image-frame`)[number - 1];
                    if (currFrame !== undefined) {
                        currFrame.style.backgroundImage = `url("${this.utils.normalizeImageUrl(injectImageURL)}")`;
                    }
                }
            });
        }
        this.getType();
    }
    state: any = {
        Description: this.inj != null ? this.inj.description : "",
        gps: this.inj != null ? [this.inj.gps[0].split(",")[0], this.inj.gps[0].split(",")[1]] : null,
        type: this.inj != null ? this.inj.type : "home",
        saveType: [],
        hotWatter: this.inj != null ? this.inj.hotWatter : false,
        waterAllTime: this.inj != null ? this.inj.waterAllTime : false,
        accessToRoof: this.inj != null ? this.inj.accessToRoof : false,
        carParking: this.inj != null ? this.inj.carParking : false,
        allowanceOfPet: this.inj != null ? this.inj.allowanceOfPet : false,
        preFurnished: this.inj != null ? this.inj.preFurnished : false,
        accessToNaturalSun: this.inj != null ? this.inj.accessToNaturalSun : false,
        storageFacility: this.inj != null ? this.inj.storageFacility : false,
        Rules: this.inj != null ? this.inj.rules : "",
        Name: this.inj != null ? this.inj.name : false,
        Location: this.inj != null ? this.inj.location : false,
        FlatSpace: this.inj != null ? this.inj.flatSpace : false,
        FrontRoadAccess: this.inj != null ? this.inj.frontRoadAccess : false,
        PricePerMonth: this.inj != null ? this.inj.pricePerMonth : false,
        updated: false,
        loader: "",
        error: []
    }
    update(ev: any) {
        const target = ev.target;
        let { name, value, type }: any = target;
        if (type === "checkbox") {
            const getFromState = this.state[name];
            this.setState({ [name]: getFromState === true ? false : true });
            return;
        }
        this.setState({ [name]: value });
    }
    utils = new Services();
    range = 8;
    getType() {
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
    upload(ev: any) {
        ev.preventDefault();
        const formData = new FormData();
        for (let i in this.state) {
            formData.append(i, this.state[i]);
        }
        this.setState({ loader: "half" });
        // if we are injecting something then, its update request
        const LoadBarAnimation = () => {
            setTimeout(() => {
                this.setState({ loader: "full" }, () => {
                    setTimeout(() => { this.setState({ loader: "" }) }, 1000)
                });
            }, 1000);
        }
        const handleErrors = (response: any) => {
            const { errors } = response;
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
            this.setState({ error: err }, () => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });

            });
        }

        // fix report
        // fixed input text length, and handled errors
        // added unsupported media type error with error handeling
        // added image file size restriction with error handeling
        if (this.inj !== null) {
            fetch(`api/property-update?id=${this.inj.id}`, {
                headers: {
                    Authorization: `Bearer ${this.utils.getToken()}`
                },
                method: "PUT",
                body: formData
            }).then((r => r.json())).then((response) => {
                const { statusCode, status } = response;
                // look handeling with errors
                if (status !== 200 && status != undefined) {
                    handleErrors(response);
                    return;
                }
                if (statusCode === 200) {
                    LoadBarAnimation();
                    alert("Updated!! ");
                    return;
                } else {
                    const { value } = response;
                    handleErrors(value);
                    this.setState({ loader: "" });
                }
            });
            return;
        }
        fetch("api/property-add", {
            headers: {
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "PUT",
            body: formData
        }).then(rsp => rsp.json()).then((response) => {
            const { statusCode, status } = response;
            if (status !== 200 && status != undefined) {
                handleErrors(response);
                return;
            }
            // look for handeling with errors
            if (statusCode === 200) {
                LoadBarAnimation();
                this.props.backView(false);
            } else {
                const { value } = response;
                handleErrors(value);
            }
        });
    }
    render() {
        const parentfunction = (arr: [number, number]) => {
            this.setState({ gps: arr })
        }
        const range: number = this.range;
        const previewImages: any = (ev: any, index: number) => {
            const file: any = ev.target.files[0];
            const url = URL.createObjectURL(file);
            const frame: any = document.getElementsByClassName("image-frame")[index - 1];
            frame.style.backgroundImage = `url("${url}")`;
            this.setState({ [`image_${index}`]: file });
        }
        const deletePreview = (index: any) => {
            if (this.inj != null) {
                // we are actually deleting it from the database
                if (`image_${index}` === "image_1") {
                    alert("First Image cannot be deleted try changing it");
                    return;
                }
                fetch(`api/delete-property-image?id=${this.inj.id}&image=${`image_${index}`}`, {
                    headers: {
                        Authorization: `Bearer ${this.utils.getToken()}`,
                        "Content-Type": "application/json"
                    },
                    method: "get"
                }).then((r) => r.json()).then((response) => {
                    const { statusCode } = response;
                    if (statusCode != 200) {
                        alert("Something went wrong!!");
                    }
                })
            }
            const dom: any = document.querySelector(`#image_${index}`);
            dom.value = ""; // we are setting the value to be empty
            const frame: any = document.getElementsByClassName("image-frame")[index - 1];
            frame.style.backgroundImage = ``; // removing the preview
            this.setState({ [`image_${index}`]: null });
        }
        return (
            <>
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
                <div id="add-property">
                    <div id={this.state.loader === "half" ? "load-bar-half" : this.state.loader === "" ? "" : "load-bar-full"}>

                    </div>
                    <div id="table-header" className="p-3 mb-2 bg-dark text-white">
                        Add property
                        {this.props.inject === null ? <button type="button" onClick={() => { this.props.backView(false) }} className="btn btn-success btn-sm add-button">Back</button> : null}
                    </div>
                    <hr className='hidden' />
                    <form onSubmit={this.upload} id="add-prop-form-grid">
                        <div className='add-p-form-g'>
                            <div className='form-labels'>
                                Name <span className='o'>*</span>
                            </div>
                            <input defaultValue={this.inj !== null ? this.inj.name : ""} onInput={this.update} className='form-control' type='text' name='Name' placeholder='title'></input>
                            <div className='form-labels'>
                                Location <span className='o'>*</span>
                            </div>
                            <input defaultValue={this.inj !== null ? this.inj.location : ""} onInput={this.update} className='form-control' type='text' name='Location' placeholder='location in words'></input>
                            <div className='form-labels'>
                                Select on map <span className='o'>*</span>
                            </div>
                            <MapComponent parentFunction={parentfunction} localizeILS={this.inj !== null ? this.inj.gps[0].split(',') : [27.6932, 85.357663]} />
                            <div className='form-labels'>
                                Facilities avalible
                            </div>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Facilities</th>
                                        <th scope="col">Avalibility</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(NormalizedBooleasn).map((i: any, j: number) => {
                                        const getFromStatev = this.state[i[0]];
                                        return (
                                            <tr key={j}>
                                                <th scope="row">{j}</th>
                                                <td>{i[1]}</td>
                                                <td>
                                                    <input onChange={(ev) => { this.update(ev) }} type='checkbox' checked={getFromStatev} name={i[0]}></input>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className='add-p-form-g'>
                            <div className='form-labels'>
                                Description <span className='o'>*</span>
                            </div>
                            <textarea defaultValue={this.inj !== null ? this.inj.description : ""} onInput={this.update} placeholder='description about your property' name="Description" className='form-control'></textarea>
                            <div className='form-labels'>
                                Rules <span className='o'>*</span>
                            </div>
                            <textarea defaultValue={this.inj !== null ? this.inj.rules : ""} onInput={this.update} placeholder='rules and regulation that must be followed on your property' name="Rules" className='form-control'></textarea>
                            <div className='form-labels'>
                                Distance to the main road (approx) <span className='o'>*</span>
                            </div>
                            <input defaultValue={this.inj !== null ? this.inj.frontRoadAccess : ""} onInput={this.update} className='form-control' type='number' name='FrontRoadAccess' placeholder='Distance from main road (highway or gateway)'></input>
                            <div className='form-labels'>
                                Price per month <span className='o'>*</span>
                            </div>
                            <input defaultValue={this.inj !== null ? this.inj.pricePerMonth : ""} onInput={this.update} className='form-control' type='number' name='PricePerMonth' placeholder='Price per momth'></input>
                            <div className='form-labels'>
                                Flat space <span className='o'>*</span>
                            </div>
                            <input defaultValue={this.inj !== null ? this.inj.flatSpace : ""} onInput={this.update} className='form-control' type='number' name='FlatSpace' placeholder='property space space cm^2'></input>
                            <div className='form-labels'>
                                Property type <span className='o'>*</span>
                            </div>
                            <select value={this.state.type} className='form-control' onInput={this.update} name='type'>
                                {this.state.saveType.map((i: any, j: number) => {
                                    return (
                                        <React.Fragment key={j}>
                                            <option value={i.name}>{i.name}</option>
                                        </React.Fragment>
                                    )
                                })}
                            </select>
                            <div className='form-labels'>
                                Images <span className='o'>*</span>
                            </div>
                            <div id="image-div">
                                {Array.from({ length: range }, (_, index) => index + 1).map((number) => {
                                    return (
                                        <div className='image-frame' key={`image_${number}`}>
                                            <div>
                                                <label htmlFor={`image_${number}`}><FaPhotoVideo /></label>
                                                <MdDelete onClick={() => { deletePreview(number) }} style={{ marginLeft: "5px" }} />
                                            </div>
                                            <input accept="image/*" onInput={(ev) => (previewImages(ev, number))} id={`image_${number}`} style={{ display: "none" }} type='file' name={`image_${number}`}></input>
                                        </div>
                                    )
                                })}
                            </div>
                            <br />
                            <div className='form-labels'>
                                <button type='submit' className='btn btn-primary'>submit</button>
                            </div>
                        </div>
                    </form>
                </div>
            </>
        )
    }
}
interface PropertyNavigateBack {
    backView: (val: boolean) => void,
    inject: any
}
export default class Property extends Component {
    constructor(props: any) {
        super(props);
        this.fetchRecords = this.fetchRecords.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    state: any = {
        newProperty: false,
        properties: null,
        totalPages: 0,
        currentPage: 1,
        conformDalogue: false,
        deleteConformId: "",
    }
    utils = new Services();
    fetchRecords(page: number) {
        fetch(`api/get-property?page=${page}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.utils.getToken()}`
            },
            method: "get"
        }).then((r) => { return r.json() }).then((response) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                const { page, property } = value;
                this.setState({ totalPages: page, properties: property });
            }
        }).catch((error) => {
            alert(error);
        })
    }
    componentDidMount(): void {
        this.fetchRecords(1);
    }
    render() {
        const backView = (val: boolean) => {
            this.setState({ newProperty: val }, () => { this.fetchRecords(1) })
        }
        const setCurrentPage = (page: number) => {
            this.setState({ currentPage: page }, () => {
                this.fetchRecords(page);
            });
        };

        const deletePropertyFrFr = (id: string) => {
            if (this.state.deleteConform === false) return;
            fetch(`api/delete-property?propertyId=${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.utils.getToken()}`
                },
                method: "delete"
            }).then((r) => r.json()).then((response) => {
                const { statusCode } = response;
                if (statusCode === 200) {
                    this.fetchRecords(this.state.currentPage);
                    this.setState({ deleteConform: "", conformDalogue: false })
                }
            })
        }
        const conformDelete = () => {
            deletePropertyFrFr(this.state.deleteConform);
        }
        const cancelDelete = () => {
            this.setState({ conformDalogue: false });
        }
        return (
            <PropertyNav>
                {this.state.conformDalogue === true && <ConformationDialoge cancelDelete={cancelDelete} conformDelete={conformDelete} />}
                {this.state.newProperty === true ? <AddProperty backView={backView} inject={null} /> : (
                    <>
                        <div id="table-header" className="p-3 mb-2 bg-dark text-white">
                            List property
                            <button type="button" onClick={() => { this.setState({ newProperty: true }) }} className="btn btn-success btn-sm add-button">List new</button>
                        </div>
                        <div className='table-wrapper'>
                            <table className="table table-light responsive">
                                <caption>{this.state.totalPages !== 0 ? "records " + this.state.totalPages : "Property management:"}</caption>
                                {this.state.totalPages !== 0 ? (
                                    <caption><Pagination renderUpTo={6} getCurrentPage={this.state.currentPage} page={this.state.totalPages} setCurrentPage={setCurrentPage} /></caption>
                                ) : null}
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Title</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Thumbnail</th>
                                        <th scope="col">Edit</th>
                                        <th scope="col">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.properties !== null ? this.state.properties.map((i: any, j: number) => {
                                        return (
                                            <tr key={j}>
                                                <th scope='row'>{j}</th>
                                                <th>{this.utils.minimalText(i.name, 15)}</th>
                                                <th>{this.utils.minimalText(i.location, 15)}</th>
                                                <th>{i.type}</th>
                                                <th><img src={i.image_1} height='25' width='25'></img></th>
                                                <th>
                                                    <NavItem style={{ listStyle: "none" }}>
                                                        <NavLink
                                                            className="upper-nav-font"
                                                            tag={Link}
                                                            to={`/edit-property?qid=${i.id}`}
                                                        >
                                                            <button className='btn btn-outline-primary'>edit</button>
                                                        </NavLink>
                                                    </NavItem>
                                                </th>
                                                <th><button onClick={() => { this.setState({ deleteConform: i.id, conformDalogue: true }) }} className='btn btn-outline-danger'>delete</button></th>
                                            </tr>
                                        )
                                    }) : null}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </PropertyNav>
        )
    }
}