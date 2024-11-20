import "../static/nav.css";
import AuthContext from "./auth/auth";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import React from "react";
import Services from "./auth/uservice";
type Props = {
    children: any;
}
type contextProps = {
    value: any
}
const Nav: React.FC<Props> = (props: any) => {
    const [mobile, setMobile] = React.useState(false);
    const [absNav, setAbsNav] = React.useState(false);
    const [profile, setProfile] = React.useState<boolean>(window.innerWidth >= 991.20 ? false : true);
    const utils = new Services();
    const resizeEvent = () => {
        window.addEventListener("resize", () => {
            if (window.innerWidth >= 991.20) {
                setProfile(false);
            } else {
                setProfile(true);
            }
            if (window.innerWidth >= 720) {
                setMobile(false);
            } else {
                setMobile(true);
            }
        });
    }
    React.useEffect(() => {
        resizeEvent();
    }, []);
    window.addEventListener("scroll", () => {
        if (window.scrollY >= 80) {
            setAbsNav(true);
        } else {
            setAbsNav(false);
        }
    })
    const ListCompoenent: React.FC<contextProps> = (props) => {
        const value = props.value;
        const { user } = value;
        return (
            <ul className="navbar-nav ml-auto">
                <li className="nav-item m-item">
                    <a className="nav-link nav-bar-lists" href="/about">About us</a>
                </li>
                {user === null ? (
                    <>
                        <li className="nav-item m-item">
                            <a href="/signup-user" className="nav-link nav-bar-lists">Sign up</a>
                        </li>
                        <li className="nav-item m-item">
                            <a href="/user-login" className="nav-link nav-bar-lists">Login</a>
                        </li>
                    </>
                ) : (
                    <>
                        <li className="nav-item m-item">
                            <a href="/user-property" className="nav-link nav-bar-lists">Your property</a>
                        </li>
                        <li className="nav-item m-item">
                            <a onClick={(ev: any) => {
                                ev.preventDefault();
                                value.logOut();
                                window.location.reload();
                            }} href="/signup-user" className="nav-link nav-bar-lists">Logout</a>
                        </li>
                    </>
                )}
            </ul>
        )
    }
    const UserComponenet = (props: any) => {
        const { userInfo } = props;
        return (
            <>
                <>
                    <div id="user-pfofile-section">
                        <div className="text-align-right">
                            {userInfo.profile != "" && (
                                <small>
                                    <img id="nav-profile-image" src={utils.normalizeImageUrl(userInfo.profile)} alt="" />
                                </small>
                            )}
                        </div>
                        <div className="text-align-right">
                            Hi {userInfo.fullName != "" ? userInfo.fullName : userInfo.email}
                        </div>
                    </div>
                </>
            </>
        )
    }
    return (
        <AuthContext.Consumer>
            {(value: any) => {
                const { userInfo } = value;
                return (
                    <div>
                        <nav id={absNav === false ? "nav-bar" : "nav-bar-abs"} className="navbar navbar-expand-lg">
                            <div className="container-fluid">
                                <NavItem style={{ listStyle: "none" }}>
                                    <NavLink
                                        className="upper-nav-font"
                                        tag={Link}
                                        to={"/"}
                                    >
                                        <div className="navbar-brand">
                                            Pie Property
                                        </div>
                                    </NavLink>
                                </NavItem>
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#navbarNav"
                                    aria-controls="navbarNav"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                    onClick={() => { mobile === true ? setMobile(false) : setMobile(true) }}
                                >
                                    <span className="navbar-toggler-icon" />
                                </button>
                                <div className="collapse navbar-collapse">
                                    <ListCompoenent value={value}></ListCompoenent>
                                </div>
                                {mobile === true && (
                                    <div id="mobile-nav">
                                        {(userInfo != null) && <UserComponenet userInfo={userInfo} />}
                                        <hr style={{ height: "20px", visibility: "hidden" }} />
                                        <ListCompoenent value={value}></ListCompoenent>
                                    </div>
                                )}
                            </div>
                            {(userInfo != null && profile === false) && <UserComponenet userInfo={userInfo} />}
                        </nav>
                        <div id="body-content">{props.children}</div>
                    </div>
                )
            }}
        </AuthContext.Consumer>
    )
}

export default Nav;