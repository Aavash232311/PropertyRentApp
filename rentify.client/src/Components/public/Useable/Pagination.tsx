import { Component } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
interface AcceptPage {
    page: number, // total page
    setCurrentPage: (num: number) => void,
    getCurrentPage: number,
    renderUpTo: number
}
export default class Pagination extends Component<AcceptPage> {
    constructor(props: any) {
        super(props);
    }
    state: any = {
        numberRow: [],
        grid: []
    }
    componentDidMount(): void {
        const grid = [];
        if (this.props.page === undefined) return;
        for (let i: number = 1; i <= this.props.page; i++) {
            grid.push(i);
        }
        // what if current page is greater than, maximum page to render
        // let's say we are on page 5, and the pagination displays 1 2 3 
        // consedering we want to render till 3 block
        let slice = grid.slice(0, this.props.renderUpTo);
        if (this.props.getCurrentPage > slice.length) { // it isn't align well
            let min = 0;
            let max = 0;  // pre init it just to debug, min, max indepenent of iteration
            while (true) {
                max = slice[slice.length - 1] + this.props.renderUpTo;
                min = slice[slice.length - 1];
                slice = grid.slice(min, max);
                if (this.props.getCurrentPage <= max) {
                    break;
                }
            }
        }
        this.setState({ numberRow: slice, grid });
    }
    render() {
        const renderGridMore = (ac: string) => {
            const grid = [...this.state.grid];
            let max = this.state.numberRow[this.state.numberRow.length - 1] + this.props.renderUpTo;
            let min = this.state.numberRow[this.state.numberRow.length - 1];
            if (ac === "+") {
                const spliced = grid.slice(min, max);
                if (spliced.length === 0) return;
                this.setState({ numberRow: spliced });
                return;
            }
            min = this.state.numberRow[0] - (this.props.renderUpTo + 1);
            max = this.state.numberRow[0] - 1;

            if (min < 0) return;
            const spliced = grid.slice(min, max);
            this.setState({ numberRow: spliced });
        }
        return (
            <>
                {this.state.numberRow !== 0 ? (
                    <div style={{ gridTemplateColumns: `repeat(${this.state.numberRow.length + 2}, 50px)`, display: "grid", width: "100%" }}>
                        <button onClick={() => { renderGridMore("-") }} className='btn btn-outline-secondary fw'><FaAngleLeft /></button>
                        {this.state.numberRow.map((i: number, j: number) => {
                            return (
                                <div key={j}>
                                    <button onClick={() => { this.props.setCurrentPage(i) }} className={this.props.getCurrentPage === i ? "btn btn-dark" : "btn btn-outline-dark"}>{i}</button>
                                </div>
                            )
                        })}
                        <button onClick={() => { renderGridMore("+") }} className='btn btn-outline-secondary fw'><FaAngleRight /></button>
                    </div>
                ) : null}
            </>
        )
    }
}