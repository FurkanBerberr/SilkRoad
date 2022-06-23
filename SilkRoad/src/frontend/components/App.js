import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItem.js'
import MyPurchases from './MyPurchases.js'
import Approve from './Approve.js'
import SilkRoad from '../contractsData/SilkRoad.json'
import SilkRoadAddress from '../contractsData/SilkRoad-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [silkroad, setMarketplace] = useState({})
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const silkroad = new ethers.Contract(SilkRoadAddress.address, SilkRoad.abi, signer)
    setMarketplace(silkroad)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home silkroad={silkroad} nft={nft} />
              } />
              <Route path="/create" element={
                <Create silkroad={silkroad} nft={nft} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems silkroad={silkroad} nft={nft} account={account} />
              } />
              <Route path="/my-purchases" element={
                <MyPurchases silkroad={silkroad} nft={nft} account={account} />
              } />
              <Route path="/approve" element={
                <Approve silkroad={silkroad} nft={nft} account={account} />
              } />
              </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;