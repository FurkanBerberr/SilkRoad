import {
    Link
} from "react-router-dom";
import { Nav } from 'react-bootstrap'
import silkroad from './SilkRoad.jpg'


const Navigation = ({ web3Handler, account }) => {
    return (
        <nav class="navbar navbar-expand-lg navbar-light bg-light bg-transparent ">
            <div class="ms-5"></div>
            <div class="ms-5"></div>
            <div class="ms-5"></div>
            <div class="ms-5"></div>
            <div class="ms-5"></div>
            <div class="ms-5"></div>
            <img src={silkroad} width="100" height="120" className="" alt="" />

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active">
                        <Nav.Link className="text-success" as={Link} to="/">Shop</Nav.Link>
                    </li>
                    <li class="nav-item">
                        <Nav.Link className="text-success" as={Link} to="/create">Create Product</Nav.Link>
                    </li>
                    <li class="nav-item">
                        <Nav.Link className="text-success" as={Link} to="/my-listed-items">My Listed Items</Nav.Link>
                    </li>
                    <li class="nav-item">
                        <Nav.Link className="text-success" as={Link} to="/my-purchases">My Purchases</Nav.Link>
                    </li>
                    <li class="nav-item">
                        <Nav.Link className="text-success" as={Link} to="/approve">Approve Transaction</Nav.Link>
                    </li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item active  ms-5"></li>
                    <li class="nav-item ms-5">
                        {account ? (

                            <a href={`https://etherscan.io/address/${account}`}>
                                <button class="btn btn-success">
                                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                                </button>
                            </a>
                        ) : (
                            <button class="btn btn-success" onClick={web3Handler}>Connect Wallet</button>
                        )}
                    </li>
                </ul>
            </div>
        </nav>

    )

}

export default Navigation;