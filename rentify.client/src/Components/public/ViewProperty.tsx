import React, { Component } from "react";
import Nav from "../nav";
import "../../static/Public/viewProperty.css";
import { IoLocation } from "react-icons/io5";
import { NormalizedBooleasn } from "./LocalAdminActions/Property";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { defaultIcon } from "./LocalAdminActions/Property";
import Services from "../auth/uservice";
import { CommonCart } from "../../App";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";

interface LocationAttributePin {
    position: [number, number]
}

const LocationMarker: React.FC<LocationAttributePin> = ({ position }) => {
    return (
        <Marker position={position} icon={defaultIcon}>
            <Popup>
                Selected Location: <br /> Latitude: {position[0]} <br /> Longitude: {position[1]}
            </Popup>
        </Marker>
    );
};
interface setMapPosition {
    position: [number, number]
}
const MapLocationPinner: React.FC<setMapPosition> = (props) => {
    return (
        <MapContainer center={props.position} zoom={14} className='render-map-full' style={{ height: "150px" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {props.position && <LocationMarker position={props.position} />}
        </MapContainer>
    )
}
class ViewProperty extends Component {
    constructor(props: any) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    state: any = {
        loading: true,
        content: null,
        userId: "",
        simialLocation: [],
        otherProperties: [],
        otherFromLandLord: []
    }
    queryString = window.location.search;
    urlParams = new URLSearchParams(this.queryString);
    utils = new Services();
    componentDidMount(): void {
        const fetchProperty = async () => {
            // recomendation means, the api is reused edit property
            // which includes searching other properties as well
            await fetch(`api/get-particular-property?id=${this.urlParams.get("id")}&recomendation=true`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(r => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    const { property, userId, simialLocation, otherProperties, otherFromLandLord } = value;
                    const currImage = this.utils.normalizeImageUrl(property[`image_1`]);
                    this.setState({ loading: false, content: property, currImage, userId, simialLocation, otherProperties, otherFromLandLord });
                }
            })
        }
        fetchProperty();
    }
    render() {
        if (this.state.loading === true) {
            return <Nav>Loading...</Nav>
        }
        const avalibleFaclilty = [];
        const avalibleImages = [];
        if (this.state.content != null) {
            for (let key in NormalizedBooleasn) {
                const currValue = NormalizedBooleasn[key];
                const check = this.state.content[key];
                if (check === true) {
                    avalibleFaclilty.push(currValue);
                }
            }
            let c = 1;
            while (true) {
                const getImages = this.state.content[`image_${c}`];
                if (getImages === undefined) break;
                if (getImages !== "" && getImages !== null) {
                    avalibleImages.push(getImages);
                }
                c++;
            }
        }
        const checkoutotherImages = (name: string) => {
            this.setState({ currImage: this.utils.normalizeImageUrl(this.state.content[name]) });
        }
        return (
            <>
                <Nav>
                    <center>
                        <div id="property-frame">
                            <div id="property-frame-grid">
                                {this.state.content !== null && (
                                    <>
                                        <div style={{ padding: "5px" }}>
                                            <div id="main-image">
                                                <img src={this.state.currImage} width="100%" height="auto" alt="" />
                                            </div>
                                            <br />
                                            {avalibleImages.length > 0 && (
                                                <>
                                                    <div id="sub-images" style={{ gridTemplateColumns: `repeat(${avalibleImages.length}, 80px)` }}>
                                                        {avalibleImages.map((i: string, j: number) => {
                                                            return (
                                                                <div key={j} className="sub-images-view">
                                                                    <img onClick={() => { checkoutotherImages(`image_${j + 1}`) }} src={i} height="80px" width="80px" alt="" />
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                            <br />
                                            <h6 className="h6 font-left-align">
                                                Distance from main road: {this.state.content.frontRoadAccess} km
                                            </h6>
                                            <h6 className="h6 font-left-align">
                                                Property space: {this.state.content.flatSpace} sq ft
                                            </h6>
                                            <h6 className="h6 font-left-align">
                                                Property type: {this.state.content.type}
                                            </h6>
                                            <NavItem style={{ listStyle: "none" }}>
                                                <NavLink
                                                    tag={Link}
                                                    to={`/UserProfile?id=${this.state.userId}`}
                                                    style={{ color: "black" }}
                                                >
                                                    <h6 style={{ textDecoration: "underline", color: "blue", cursor: "pointer", fontWeight: 'bold' }} className="h6 font-left-align">
                                                        View user and contact info
                                                    </h6>
                                                </NavLink>
                                            </NavItem>
                                        </div>
                                        <div>
                                            <br />
                                            <h2 className="h2 font-left-align">{this.state.content.name}</h2>
                                            <h6 className="h6 font-left-align">
                                                {this.state.content.location} {" "} <IoLocation />
                                            </h6>
                                            <div className="h6 font-left-align">
                                                {this.state.content.description}
                                            </div>
                                            <h2 className="h2 font-left-align">Price per month</h2>
                                            <div className="h6 font-left-align">
                                                <b>Rs {this.state.content.pricePerMonth}</b>
                                            </div>
                                            <h6 className="h6 font-left-align">
                                                Rules to be followed:
                                            </h6>
                                            <div className="h6 font-left-align">
                                                {this.state.content.rules}
                                            </div>
                                            {avalibleFaclilty.length > 0 && (
                                                <>
                                                    <h2 className="h2 font-left-align">
                                                        Facilities
                                                    </h2>
                                                    {avalibleFaclilty.map((i: string, j: number) => {
                                                        return (
                                                            <div style={{ textAlign: "left" }} key={j}>{i}</div>
                                                        )
                                                    })}
                                                </>
                                            )}
                                            <h2 className="h2 font-left-align">
                                                Map
                                            </h2>
                                            <div id="map-div-view">
                                                <MapLocationPinner position={this.state.content.gps[0].split(",")} />
                                            </div>
                                            <hr style={{ visibility: "hidden", height: "50px" }} />
                                        </div>
                                    </>
                                )}
                            </div>
                            <hr style={{ visibility: "hidden" }} />
                            {this.state.simialLocation.length > 0 && (
                                <div>
                                    <div className='veiw-page-label'>
                                        <h4 className='h4 cart-type-view-page'>
                                            In the near location
                                        </h4>
                                    </div>
                                    <div style={{ gridTemplateColumns: `repeat(${this.state.simialLocation.length}, 280px)` }} className='cart-hanger'>
                                        {this.state.simialLocation.map((i: any, j: number) => {
                                            return (
                                                <React.Fragment key={j}>
                                                    <div>
                                                        <CommonCart object={i} />
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            {this.state.otherProperties.length > 0 && (
                                <div>
                                    <div className='veiw-page-label'>
                                        <h4 className='h4 cart-type-view-page'>
                                            Other properties
                                        </h4>
                                    </div>
                                    <div style={{ gridTemplateColumns: `repeat(${this.state.otherProperties.length}, 280px)` }} className='cart-hanger'>
                                        {this.state.otherProperties.map((i: any, j: number) => {
                                            return (
                                                <React.Fragment key={j}>
                                                    <div>
                                                        <CommonCart object={i} />
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                                {this.state.otherFromLandLord.length > 0 && (
                                <div>
                                    <div className='veiw-page-label'>
                                        <h4 className='h4 cart-type-view-page'>
                                            Other from land lord
                                        </h4>
                                    </div>
                                    <div style={{ gridTemplateColumns: `repeat(${this.state.otherFromLandLord.length}, 280px)` }} className='cart-hanger'>
                                        {this.state.otherFromLandLord.map((i: any, j: number) => {
                                            return (
                                                <React.Fragment key={j}>
                                                    <div>
                                                        <CommonCart object={i} />
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </center>
                </Nav>
            </>
        )
    }
}

export default ViewProperty;