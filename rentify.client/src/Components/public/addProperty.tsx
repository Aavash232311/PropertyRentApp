// src/components/MapComponent.tsx
import { Component } from 'react';
import "../../static/room.css";
import { CiLock } from "react-icons/ci";
import { MdOutlineHouse } from "react-icons/md";
import { TbMathIntegral } from "react-icons/tb";
import { CiBellOn } from "react-icons/ci";
import { IoMdList } from "react-icons/io";
import { GiReactor } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
type Props = {
  children: any
}
export default class PropertyNav extends Component<Props> {
  state = {
    show: true, // makes the nav bar shrink and shows the icon
    showSideBar: true, // shows and hides the side bar
  }
  constructor(props: any) {
    super(props);
  }
  icons: any = {
    property: <MdOutlineHouse />,
    analytics: <TbMathIntegral />,
    notification: <CiBellOn />,
    security: <CiLock />,
    show: <IoMdList />,
    "Action Table": <GiReactor />,
    profile: <FaRegUser />,
    surf: <CgWebsite />
  }
  componentDidMount(): void {
    if (window.innerWidth <= 720) {
      this.setState({ show: false });
    }
  }
  render() {
    const IconMapperLocalNav: any = (props: any) => {
      const key = props.label;
      if (this.state.show === true) {
        return key;  // returns the key which is the arguement passed (expanded nav bar)
      }
      return this.icons[key]; // returns icon nav bar
    }
    const sideBarToggle = () => { // hamburger icon toggle
      if (this.state.showSideBar === true) {
        this.setState({ showSideBar: false })
      } else {
        this.setState({ showSideBar: true })
      }
    }
    return (
      <>
        <div>
          <div id={this.state.showSideBar === false ? "full-width-loc-admin" : this.state.show === true ? "nav-frame" : "nav-frame-mobile"}>
            {this.state.showSideBar === true && (
              <>
                <div id={this.state.show === true ? "local-nav" : "local-nav-mobile"} className='p-3 mb-2 bg-dark text-white'>
                  <center>
                    <br />
                    <h6 style={{ color: "white" }}>
                      <IconMapperLocalNav label="Action Table" />
                    </h6>
                    <hr />
                  </center>
                  <NavItem style={{ listStyle: "none" }}>
                    <NavLink
                      className="upper-nav-font"
                      tag={Link}
                      to={"/user-property"}
                    >
                      <div className='nav-labels-local'>
                        <IconMapperLocalNav label="property" />
                      </div>
                    </NavLink>
                  </NavItem>
                  <NavItem style={{ listStyle: "none" }}>
                    <NavLink
                      className="upper-nav-font"
                      tag={Link}
                      to={"/user-profile"}
                    >
                      <div className='nav-labels-local' >
                        <IconMapperLocalNav label="profile" />
                      </div>
                    </NavLink>
                  </NavItem>
                  <div className='nav-labels-local' onClick={() => { this.setState({ show: this.state.show === true ? false : true }) }}>
                    <IconMapperLocalNav label="show" />
                  </div>
                  <NavItem style={{ listStyle: "none" }}>
                    <NavLink
                      className="upper-nav-font"
                      tag={Link}
                      to={"/"}
                    >
                      <div className='nav-labels-local' onClick={() => { this.setState({ componenet: "surf" }) }}>
                        <IconMapperLocalNav label="surf" />
                      </div>
                    </NavLink>
                  </NavItem>
                </div>
              </>
            )}
            <div id="local-content">
              <div id='mobile-nav-toggle' className="p-3 mb-2 bg-light text-dark">
                <div>
                  <RxHamburgerMenu id='toggle-icon-frame' onClick={sideBarToggle} />
                </div>
              </div>
              {this.props.children}
            </div>
          </div>
        </div>
      </>
    )
  }
}