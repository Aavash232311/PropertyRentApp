import React, { Component, ReactNode } from "react";
import Nav from "../../nav";
import { MapComponent } from "../LocalAdminActions/Property";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import "../../../static/Public/map.css";

export default class MapSearchHaversineRadii extends Component {
    constructor(props: any) {
        super(props);
        this.update = this.update.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    state: any = {
        coordinate: [27.6932, 85.357663],
        distance: 1,
        type: [],
        typeofProperty: ""
    }
    update(ev: any) {
        this.setState({ [ev.target.name]: ev.target.value });
    }

    componentDidMount(): void {
        const fetchCategory = async () => {
            await fetch(`api/get-type-property`, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "get"
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    this.setState({ typeofProperty: value[0].name })
                    this.setState({ type: value });
                }
            });
        }
        fetchCategory();
    }

    render(): ReactNode {
        const parentfunction = (arr: [number, number]) => {
            this.setState({ coordinate: arr });
        }
        return (
            <Nav>
                <div>
                    <center>
                        <div id="input-frame">
                            <div className='cart-label'>
                                Pick the location in map which will pick the coordinate, and select the distance in range you want to find the property:
                                {"  "}<b>{this.state.coordinate.join(",")}</b>
                            </div>
                            <div>
                                <MapComponent parentFunction={parentfunction} localizeILS={[27.6932, 85.357663]} />
                            </div>
                            <div className="cart-label">
                                Select the distance (km) range (ex: I want the property to be within 5km of my school, or main highway)
                                {" "} {this.state.distance} <b>km.</b>
                            </div>
                            <input defaultValue={1} onInput={this.update} name="distance" className="map-search-input" type="range" min="1" max="20"></input> <br />
                            <div className='cart-label'>
                                Type of peoperty that you are looking for:
                            </div>
                            <select name="typeofProperty" onInput={this.update} defaultValue={this.state.typeofProperty} className="map-search-input form-control">
                                {this.state.type.map((i: any, j: number) => {
                                    return (
                                        <React.Fragment key={j}>
                                            <option value={i.name}>{i.name}</option>
                                        </React.Fragment>
                                    )
                                })}
                            </select>
                            <hr style={{ visibility: "hidden", height: "20px" }} />
                            <NavItem style={{ listStyle: "none" }}>
                                <NavLink
                                    className="upper-nav-font"
                                    tag={Link}
                                    to={`/property-search?coordinate=${this.state.coordinate.join(",")}&distance=${this.state.distance}&typeofProperty=${this.state.typeofProperty}&type=hv&page=1`} 
                                >
                                    <button className="btn btn-primary map-search-input">search</button>
                                </NavLink>
                            </NavItem>
                        </div>
                    </center>
                </div>
            </Nav>
        )
    }
}