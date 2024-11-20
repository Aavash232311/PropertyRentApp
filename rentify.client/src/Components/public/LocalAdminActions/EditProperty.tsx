import { Component } from "react";
import { AddProperty } from "./Property";
import PropertyNav from "../addProperty";
import Services from "../../auth/uservice";

export default class EditCompoenentProperty extends Component {
    constructor(props: any) {
        super(props);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    queryString = window.location.search;
    urlParams = new URLSearchParams(this.queryString);
    id = this.urlParams.get("qid");
    utils = new Services();
    state = {
        inject: null,
        loading: true,
    }
    componentDidMount(): void {
        const inj = async () => {
            await fetch(`api/get-user-property?id=${this.id}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                     Authorization: `Bearer ${this.utils.getToken()}`
                }
            }).then((r) => r.json()).then((res) => {
                const { statusCode, value } = res;
                if (statusCode === 200) {
                    this.setState({ inject: value, loading: false });
                }
            });
        }
        inj();
    }
    // make sure only the user author to this particular product can edit it
    render() {
        if (this.state.loading === true) {
            return (
                <PropertyNav>
                    Loaing....
                </PropertyNav>
            )
        }
        return (
            <AddProperty inject={this.state.inject} backView={(v: boolean) => { v }} />
        )
    }
}