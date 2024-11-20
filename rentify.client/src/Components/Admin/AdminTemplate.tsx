import { Component } from "react";
import "../../static/Admin/hoc.css";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
type Props = {
    children: any;
    currentPage: any;
}
// lets add restriction here too
const ref = [
    {
        label: "Essential",
        link: "/admin-essentail",
        role: ["superuser"]
    },
    {
        label: "Highlights",
        link: "/highlight-property-home-page",
        role: ["superuser"]
    },
    {
        label: "info",
        link: "/info-about",
        role: ["superuser"]
    },
    {
        label: "Users",
        link: "/user-admin",
        role: ["superuser"]
    },
    {
        label: "Admin logs",
        link: "/logs-lang",
        role: ["superuser"]
    },
    {
        label: "My site",
        link: "/"
    }
];
export default class AdminWrapper extends Component<Props> {
    state: any = {
        mobile: false,
    }
    render() {
        return (
            <>
                <div id={this.state.mobile === true ? "nav-admin-mobile" : "nav-admin-grid"}>
                    <>
                        <div id="nav-admin" style={{ display: this.state.mobile === true ? "none" : "block" }}>
                            <br />
                            <center>
                                <h6>
                                    Admin
                                </h6>
                            </center>
                            <hr />
                            {ref.map((i: any, j: number) => {
                                return (
                                    <div key={j}>
                                        <NavItem style={{ listStyle: "none" }}>
                                            <NavLink
                                                className="upper-nav-font"
                                                tag={Link}
                                                to={i.link}
                                            >
                                                <div className="nav-admin-links" style={{ fontWeight: i.label === this.props.currentPage ? "bold" : "" }}>
                                                    {i.label}
                                                </div>
                                            </NavLink>
                                        </NavItem>
                                    </div>
                                )
                            })}
                        </div>
                        <div id="admin-content">
                            <div id="top-nav-admin" className="p-3 mb-2 bg-dark text-white">
                                <GiHamburgerMenu onClick={() => {
                                    const cd = this.state.mobile;
                                    cd === true ? this.setState({ mobile: false }) : this.setState({ mobile: true });
                                }} style={{ fontWeight: "24px" }} />
                            </div>
                            {this.props.children}
                        </div>
                    </>
                </div>
            </>
        )
    }
}