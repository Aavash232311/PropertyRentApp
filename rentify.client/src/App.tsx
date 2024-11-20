import './App.css';
import { CiSearch, CiLocationOn, CiMap, CiGps } from "react-icons/ci";
import 'bootstrap/dist/css/bootstrap.css';
import React from "react";
import Services from './Components/auth/uservice';
import Nav from './Components/nav';

export const OnBoardGPS = (type: string) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
            const { coords } = p;
            const { latitude, longitude } = coords;
            const url = `/property-search?coordinate=${[latitude, longitude]}&distance=${10}&typeofProperty=${type}&type=hv&page=1`;
            window.location.href = url;
        });
    } else {
        alert("NO ON BOARD GPS SUPPORT");
    }
}

export const normSearch = (qry: any, t: any, page: number) => {
    window.location.href = `/property-search?query=${qry}&typeofProperty=${t}&page=${page}&type=norm`;
}
function App() {
    const [image, setImage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [property, setProperty] = React.useState([]);
    const [highlight, setHighlight] = React.useState([]);
    const [category, setCategory]: any = React.useState([]);
    const [type, setType] = React.useState("Home");
    const [query, setQuery]: any = React.useState("");
    const utils = new Services();
    React.useEffect(() => {
        const fetchImage = async () => {
            await fetch("api/get-themed-image", {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                }
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    setImage((value.image));
                }
            }).finally(() => {
                setLoading(false);
            });
        };
        const fetchSuggestion = async () => {
            await fetch("api/property-home-page", {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                }
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    setProperty(value);
                }
            })
        }

        const fetchHighights = async () => {
            await fetch(`api/get-themes-admin-home`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "get"
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    setHighlight(value);
                }
            })
        }
        const fetchCategory = async () => {
            await fetch(`api/get-type-property`, {
                headers: {
                    "Content-Type": "application/json"
                },
                method: "get"
            }).then((r) => r.json()).then((response) => {
                const { statusCode, value } = response;
                if (statusCode === 200) {
                    setCategory(value);
                    setType(value[0].name);
                }
            })
        }

        const fetchAll = async () => {
            try {
                await Promise.all([fetchImage(), fetchSuggestion(), fetchHighights(), fetchCategory()]);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };


        fetchAll();
    }, []);
    if (loading) return <div>Loading...</div>;
    // Home Page Design
    // search engene (api and pages)
    // View content page (contact number)
    // Edit content
    // auth
    return (
        <Nav>
            <div style={{ backgroundImage: `url('${utils.normalizeImageUrl(image)}')` }} id='poster-image'>
                <div id='search-bar-frame'>
                    <div id="search-bar-frame-grid">
                        <div className='center-align'>
                            <input name='query' onInput={(ev: any) => { setQuery(ev.target.value) }} placeholder='search' type="text" className='search-app-input' />
                        </div>
                        <div className='center-align'>
                            <select onInput={(ev: any) => { setType(ev.target.value) }} className='search-app-input'>
                                {category.map((i: any, j: number) => {
                                    return (
                                        <React.Fragment key={j}>
                                            <option value={i.name}>{i.name}</option>
                                        </React.Fragment>
                                    )
                                })}
                            </select>
                        </div>
                        <div className='center-align'>
                            <button onClick={() => {
                                OnBoardGPS(type);
                            }} className='btn-search btn btn-secondary'>
                                <div className='app-search-labels'>
                                    Near me
                                </div>
                                <div className='app-search-mobile-icon'>
                                    <CiGps />
                                </div>
                            </button>
                        </div>
                        <div className='center-align'>
                            <button onClick={() => {
                                normSearch(query, type, 1);
                                window.location.href = "/map-search";
                            }} className='btn-search btn btn-secondary'>
                                <div className='app-search-labels'>
                                    Map search
                                </div>
                                <div className='app-search-mobile-icon'>
                                    <CiMap />
                                </div>
                            </button>
                        </div>
                        <div className='center-align'>
                            <button onClick={() => {
                                normSearch(query, type, 1)
                            }} className='btn-search btn btn-secondary'>
                                <CiSearch />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {highlight.map((obj: any, index: number) => {
                const { properties } = obj;
                return (
                    <React.Fragment key={index}>
                        <hr style={{ visibility: "hidden" }} />
                        <div className='home-page-label'>
                            <h4 className='h4 cart-type'>
                                {obj.label}
                            </h4>
                        </div>
                        <div className='cart-hanger'>
                            {properties.map((i: any, j: number) => {
                                return (
                                    <React.Fragment key={j}>
                                        <div>
                                            <CommonCart object={i} />
                                        </div>
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </React.Fragment>
                )
            })}
            {property.map((obj: any, index: number) => {
                const { data } = obj;
                return (
                    <React.Fragment key={index}>
                        <hr style={{ visibility: "hidden" }} />
                        <div className='home-page-label'>
                            <h4 className='h4 cart-type'>
                                {obj.type}
                            </h4>
                        </div>
                        <div className='cart-hanger'>
                            {data.map((i: any, j: number) => {
                                return (
                                    <React.Fragment key={j}>
                                        <div>
                                            <CommonCart object={i} />
                                        </div>
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </React.Fragment>
                )
            })}
        </Nav>
    );
}
interface CartArgs {
    object: any
}
export const CommonCart: React.FC<CartArgs> = (prop: any) => {
    const item = prop.object;
    return (
        <div className='cart' onClick={() => { window.open(`/property-view?id=${item.id}`, '_blank') }}>
            <img className='image-cart' src={item.image_1}></img>
            <div className='cart-label name-cart-label'>
                {item.name}
            </div>
            <div className='cart-label location-cart-label'>
                {item.location} <CiLocationOn />
            </div>
            <div className='cart-label-not-bold'>
                Rs: {item.pricePerMonth}
            </div>
        </div>
    )
}

export default App;