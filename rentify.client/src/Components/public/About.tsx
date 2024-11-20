import { Component, ReactNode } from "react";
import Nav from "../nav";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import "../../static/Admin/info.css";

export default class About extends Component {
    constructor(props: any) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    state: any = {
        loading: true,
    }
    componentDidMount(): void {
        fetch("api/About-Site", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            },
        }).then((r) => r.json()).then((response: any) => {
            const { statusCode, value } = response;
            if (statusCode === 200) {
                const { aboutUs, contactEmail, contactPhone, faceBookPage, instaGram, youtubePage } = value;
                this.setState({
                    AboutUs: aboutUs,
                    InstaGram: instaGram,
                    FaceBookPage: faceBookPage,
                    YoutubePage: youtubePage,
                    ContactEmail: contactEmail,
                    ContactPhone: contactPhone,
                    loading: false
                });
            }
        })
    }
    render(): ReactNode {
        return (
            <Nav>
                <div className="about-container">
                    {this.state.loading && <h1>loading...</h1>}
                    {this.state.loading === false && (
                        <>
                            <h1>About Us</h1> <p>{this.state.AboutUs}</p> <br />
                            <h1>Contact Information</h1>
                            {this.state.FaceBookPage && (<><a className="about-anchor" href={this.state.FaceBookPage}><FaFacebookF /> {this.state.FaceBookPage}</a> <br /></>)}
                            {this.state.InstaGram && (<><a className="about-anchor" href={this.state.InstaGram}><FaInstagram /> {this.state.InstaGram}</a> <br /></>)}
                            {this.state.YoutubePage && (<><a className="about-anchor" href={this.state.YoutubePage}><FaYoutube /> {this.state.YoutubePage}</a> </>)} <br />
                            <p>Email:- <b>{this.state.ContactEmail}</b></p> <br />
                            {this.state.ContactPhone && (
                                <>
                                    <p>Contact Number:- <b>{this.state.ContactPhone}</b> </p>
                                </>
                            )}
                        </>
                    )}
                </div>
            </Nav>
        )
    }
}