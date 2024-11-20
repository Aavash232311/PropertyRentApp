import React, { Component, ReactNode } from "react";
import "../../static/Public/result.css";
import { CiMap } from "react-icons/ci";
import { OnBoardGPS } from "../../App";
import { RiGpsFill } from "react-icons/ri";
import Nav from "../nav";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MdCancel } from "react-icons/md";
import { defaultIcon } from "./LocalAdminActions/Property";
import Pagination from "./Useable/Pagination";
import { NormalizedBooleasn } from "./LocalAdminActions/Property";
import { normSearch } from "../../App";

export const MapComponent: React.FC = ({ }) => {
  return (
    <MapContainer center={[27.6932, 85.357663]} zoom={14} className='render-map-full showcasemap'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
};
interface NoMap {
  dontShowMap: () => void,
  gps: any
}
interface LocationAttribute {
  position: [number, number],
  obj: any
}
const LocationMarker: React.FC<LocationAttribute> = ({ position, obj }) => {
  return (
    <Marker position={position} icon={defaultIcon}>
      <Popup>
        Selected Location: <br /> Latitude: {position[0]} <br /> Longitude: {position[1]}
        <br />
        <span>{obj.name}</span>
        <br />
        <a href={`view?id=${obj.id}`}>view..</a>
      </Popup>
    </Marker>
  );
};
const MapWithGpsSorted: React.FC<NoMap> = (props) => {
  const gps = props.gps;
  if (gps.length === 0) return "Something wen't wrong :(";
  return (
    <>
      <div style={{ float: "right", marginRight: "15px" }}>
        <MdCancel onClick={props.dontShowMap} />
      </div>
      <MapContainer center={[27.6932, 85.357663]} zoom={13} id="show-map" >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {gps.map((cord: any, index: number) => {
          const { coordinate, item } = cord;
          return (
            <React.Fragment key={index}>
              <LocationMarker position={coordinate} obj={item} />
            </React.Fragment>
          )
        })}
      </MapContainer>
    </>
  )
}
export const conditionalSubString = (str: string, maxLen: number) => {
  return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
}
class ResultPage extends Component {
  constructor(props: any) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.fetchResult = this.fetchResult.bind(this);
    this.setCurrentPage = this.setCurrentPage.bind(this);
    this.update = this.update.bind(this);
  }
  queryString = window.location.search;
  urlParams = new URLSearchParams(this.queryString);
  coordinate: any = this.urlParams.get("coordinate")?.split(",");
  distance = this.urlParams.get("distance");
  typeofProperty = this.urlParams.get("typeofProperty");
  type = this.urlParams.get("type");
  page: any = this.urlParams.get("page");
  query: any = this.urlParams.get("query");


  state: any = {
    result: [],
    totalPage: 0,
    currentPage: 1,
    category: [],
    showMap: false,
    gps: [],
    loading: true,
    facilities: [],
    backup: [],
    query: "",
    tpye: "",
    searchType: "",
    searchQuery: "",
    showResultMap: window.innerWidth > 789 ? true : false
  }
  update(ev: any) {
    this.setState({ [ev.target.name]: ev.target.value });
  }

  fetchResult() {
    const ressolveData = (value: any) => {
      const { result, totalPage } = value;
      let gps = [];
      for (let i in result) {
        const gpsCoordinates = result[i].gps[0].split(",");
        const gpsArr = [parseFloat(gpsCoordinates[0]), parseFloat(gpsCoordinates[1])];
        gps.push({
          coordinate: gpsArr,
          item: result[i]
        });
      }
      this.setState({ result, totalPage, gps, loading: false, backup: result })
    }
    if (this.type === "hv") {
      // we need to get the following paramaters
      // coordinate
      // distance
      // type of property
      let coordinate = [parseFloat(this.coordinate[0]), parseFloat(this.coordinate[1])];
      fetch('api/hv-search', {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          coordinate: coordinate,
          distance: this.distance,
          type: this.typeofProperty,
          page: this.page,
        })
      }).then(response => response.json())
        .then((response) => {
          const { statusCode, value } = response;
          if (statusCode === 200) {
            ressolveData(value);
          }
        })
        .catch(error => console.error('Error:', error));
      return;
    } else if (this.type === "norm") {
      fetch(`api/search?query=${this.query}&type=${this.typeofProperty}&page=${this.page}`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "get"
      }).then((r) => r.json()).then((response) => {
        const { value, statusCode } = response;
        if (statusCode === 200) {
          ressolveData(value);
        }
      }).catch(error => console.error('Error:', error));
    }
  }
  componentDidMount() {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 789) {
        this.setState({ showResultMap: true });
      }
    })
    const fetchCategory = async () => {
      await fetch(`api/get-type-property`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "get"
      }).then((r) => r.json()).then((response) => {
        const { statusCode, value } = response;
        if (statusCode === 200) {
          this.setState({ category: value, searchType: value[0].name });
        }
      })
    }
    fetchCategory();
    const facilities = [];
    for (let i in NormalizedBooleasn) {
      facilities.push(
        {
          key: i,
          normalizedKey: NormalizedBooleasn[i],
          value: false
        }
      )
    }
    this.setState({ currentPage: parseInt(this.page), facilities });
    this.fetchResult();
  }
  setCurrentPage = (page: number) => {
    if (this.type === 'hv') {
      window.location.href = (`/property-search?coordinate=${this.coordinate}&distance=${this.distance}&typeofProperty=${this.typeofProperty}&type=hv&page=${page}`);
    } else {
      window.location.href = `/property-search?query=${this.query}&typeofProperty=${this.typeofProperty}&page=${page}&type=norm`;
    }
  }
  render(): ReactNode {
    const dontShowMap = () => {
      this.setState({ showMap: false });
    }
    if (this.state.showMap) {
      return (
        <>
          <Nav>
            <MapWithGpsSorted gps={this.state.gps} dontShowMap={dontShowMap} />
          </Nav>
        </>
      )
    }
    const filter = (ev: any) => {
      let { value, name } = ev.target;
      value = value === "true" ? true : false;
      const filerState = [...this.state.facilities];
      for (let i in filerState) {
        const obj = filerState[i];
        if (obj.normalizedKey === name) {
          obj.value = value === true ? false : true;
          break;
        }
      }
      this.setState({ facilities: filerState }, () => {
        filterReuse();
      });
    }

    const filterReuse = () => {
      // result wont be in combination
      // either one of them should be true
      const checkedFileds: any = [];
      const facilities = [...this.state.facilities];
      for (let i in facilities) {
        if (facilities[i].value === true) {
          checkedFileds.push(facilities[i].key);
        }
      }
      const result = [...this.state.backup];
      const filtered: any = [];
      result.map((i: any) => {
        const curr = i;
        for (let j in checkedFileds) {
          if (curr[checkedFileds[j]] === true) {
            filtered.push(curr);
            break;
          }
        }
      });
      this.setState({ result: checkedFileds.length > 0 ? filtered : this.state.backup });
    }

    const Sort = (ev: any) => {
      const { value } = ev.target;
      let res = [...this.state.result];
      if (value === "low-to-high") {
        res = res.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
      } else if (value === "high-to-low") {
        res = res.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
      } else {
        filterReuse();
        return;
      }
      this.setState({ result: res });
    }
    return (
      <Nav>
        <hr style={{ visibility: "hidden" }} />
        <div id="result">
          <center>
            <div id="result-grid">
              <div id="filter">
                <div className='center-align'>
                  <input onInput={this.update} name="searchQuery" style={{ width: "100%", marginLeft: "5px" }} type="text" className="form-control" placeholder='location, name' />
                </div>
                <div className='center-align'>
                  <select onInput={(ev: any) => {
                    const value: any = ev.target.value;
                    this.setState({ searchType: value });
                  }} className='form-control'>
                    {this.state.category.map((i: any, j: number) => {
                      return (
                        <option value={i.name} key={j}>{i.name}</option>
                      )
                    })}
                  </select>
                </div>
                <div className={`center-align ${window.innerWidth < 479 ? "button-9 extend-mobile-search" : ""}`}>
                  {window.innerWidth < 479 ? "Search near you " : <RiGpsFill onClick={() => { OnBoardGPS(this.state.searchType) }} />}
                </div>
                <div className={`center-align ${window.innerWidth < 479 ? "button-9 extend-mobile-search" : ""}`}>
                  <NavItem style={{ listStyle: "none" }}>
                    <NavLink
                      className="upper-nav-font"
                      tag={Link}
                      to={"/map-search"}
                    >
                      {window.innerWidth < 479 ? "Search using a map " : <CiMap />}
                    </NavLink>
                  </NavItem>
                </div>
                <div className='center-align'>
                  <button onClick={() => { normSearch(this.state.searchQuery, this.state.searchType, 1) }} id="result-btn-search" className="button-9">
                    Search
                  </button>
                </div>
              </div>
              <div id="result-content">
                <div>
                  <div id="filter-buttons">
                    { /*  why to overload since we arent using this feaure in mobile devices */}
                    {this.state.showResultMap && (
                      <>
                        <MapComponent />
                        <a href="" onClick={(ev) => { ev.preventDefault(); this.setState({ showMap: true }) }}>show on map</a>
                        <hr style={{ visibility: "hidden" }} />
                        <center>
                          <h6 className="h6">filter by</h6>
                        </center>
                        <hr />
                      </>
                    )}

                    {this.state.facilities.map((i: any, j: number) => {
                      return (
                        <React.Fragment key={j}>
                          <div className="form-check filter-check-box">
                            <label className="form-check-label" htmlFor={`d${j}`}>
                              {i.normalizedKey}
                            </label>
                            <input
                              className="form-check-input filter-check-label"
                              type="checkbox"
                              value={i.value}
                              name={i.normalizedKey}
                              onInput={filter}
                              id={`d${j}`}
                            />
                          </div>
                        </React.Fragment>
                      )
                    })}
                    <br />
                    <center>
                      <h6 className="h6">price range</h6>
                    </center>
                    <hr />
                    <select onInput={Sort} defaultValue="all" name="" className="form-control filter-price">
                      <option value="high-to-low">High to low</option>
                      <option value="low-to-high">Low to high</option>
                      <option value="all">all</option>
                    </select>
                  </div>
                </div>
                <div id="result-frame">
                  {this.state.result.length === 0 && (
                    <>
                      No result found, try using another paramater: 404
                    </>
                  )}
                  {this.state.loading === false ? this.state.result.map((i: any, j: number) => {
                    return (
                      <React.Fragment key={j}>
                        <div className="horizontal-cart" onClick={() => {
                          if (window.innerWidth <= 720) {
                            window.location.href = `/property-view?id=${i.id}`
                          }
                        }}>
                          <div>
                            <img className="hortzontal-cart-image" src={i.image_1}></img>
                          </div>
                          <div className="h-cart-text-part">
                            <br />
                            <div className='cart-label'>
                              {conditionalSubString(i.name, 50)}
                            </div>
                            <div className='cart-label'>
                              <a href="">{i.location}</a>
                            </div>
                          </div>
                          <div className="view-button">
                            <div className='cart-label'>
                              {i.type}
                            </div>
                            <div className='cart-label'>
                              Rs. {i.pricePerMonth}
                            </div>
                            <NavItem style={{ listStyle: "none" }}>
                              <NavLink
                                className="upper-nav-font"
                                tag={Link}
                                to={`/property-view?id=${i.id}`}
                                state={i}
                                target="_blank"
                              >
                                <button style={{ width: "80%", float: "left" }} className="button-9">view</button>
                              </NavLink>
                            </NavItem>
                          </div>
                        </div>
                        <br />
                      </React.Fragment>
                    )
                  }) : (
                    <>
                      Loading...
                    </>
                  )}
                  {this.state.loading === false && this.state.result.length != 0 &&
                    (
                      <>
                        <hr style={{ visibility: "hidden" }} />
                        <div id="pagination-frame">
                          <Pagination setCurrentPage={this.setCurrentPage} renderUpTo={window.innerWidth < 479 ? 5 : 10} getCurrentPage={this.state.currentPage} page={this.state.totalPage} />
                        </div>
                      </>
                    )}
                </div>
              </div>
            </div>
          </center>
        </div >
      </Nav >
    )
  }
}
export default (ResultPage);