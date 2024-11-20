import { Component } from "react";
import "../../../static/Useable/conformation.css";

interface ConformDialoge {
    conformDelete: () => void;
    cancelDelete: () => void;
}
export default class ConformationDialoge extends Component<ConformDialoge> {
    constructor(props:any) {
        super(props);
    }
    render() {
        return (
            <div id="confirmation-modal">
                <div>
                    <p>Are you sure you want to delete this? <b>This action cannot be undone.</b></p>
                    <div className='conformation-button'>
                        <button onClick={() => {this.props.conformDelete()}} id="confirm-delete" className='btn btn-primary'>Yes</button>
                        <button onClick={() => {this.props.cancelDelete()}} id="cancel-delete" className='btn btn-danger'>No</button>
                    </div>
                </div>
            </div>
        )
    }
}