const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("SilkRoad", async function(){
    let deployer, addr1, addr2, nft, silkRoad
    let feePercent = 1
    let URI = "Sample URI"

    beforeEach(async function(){
        const NFT = await ethers.getContractFactory("NFT");
        const SilkRoad = await ethers.getContractFactory("SilkRoad");
    
        [deployer, addr1, addr2] = await ethers.getSigners();
    
        nft = await NFT.deploy();
        silkRoad = await SilkRoad.deploy(feePercent);
    });

    describe("Deployment", function(){
        it("Should track name and symbol of the nft collection", async function(){
            expect(await nft.name()).to.equal("SilkRoad NFT")
            expect(await nft.symbol()).to.equal("SilkRoad")
        })
        it("Should track feeAccount and feePercen of the marketplace", async function(){
            expect(await silkRoad.feeAccount()).to.equal(deployer.address)
            expect(await silkRoad.feePercent()).to.equal(feePercent)
        })
    })
    describe("Mint NFT", function(){
        it("Should track each minted NFT", async function(){
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
            
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        })
    })
    describe("Making marketplace items", function (){
        beforeEach(async function () {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(silkRoad.address, true)
        })
        it("Should track newly created item, transfer NFT from seller to marketplace and exit Offered event", async function (){
            await expect(silkRoad.connect(addr1).makeItem(nft.address, 1, toWei(1), 50))
                .to.emit(silkRoad,"Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr1.address
                )
            expect(await nft.ownerOf(1)).to.equal(silkRoad.address)
            expect(await silkRoad.itemCount()).to.equal(1)

            const item = await silkRoad.items(1)
            expect(item.itemId).to.equal(1)
            expect(item.nft).to.equal(nft.address)
            expect(item.tokenId).to.equal(1)
            expect(item.price).to.equal(toWei(1))
            expect(item.sold).to.equal(false)
            expect(item.mConfirm).to.equal(false)
        });

        it("Should fail if price is set to zero", async function (){
            await expect(
                silkRoad.connect(addr1).makeItem(nft.address, 1, 0, 50)
            ).to.be.revertedWith("Price must be greater than zero");
        });
    });

    describe("Purchasing marketplace items", function(){
        let price = 2
        let totalPriceInWei
        beforeEach(async function () {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(silkRoad.address, true)
            await silkRoad.connect(addr1).makeItem(nft.address, 1, toWei(2), 50)
        })
        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function(){
            const sellerInitialEthBal = await addr1.getBalance()
            const feeAccountInitialEthBal = await deployer.getBalance()
            totalPriceInWei = await silkRoad.getTotalPrice(1)


            await expect(silkRoad.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
                .to.emit(silkRoad, "Bought")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(price),
                    addr1.address,
                    addr2.address,
                    false,
                    false
                )
            const sellerFinalEthBal = await addr1.getBalance()
            const feeAccountFinalEthBal = await deployer.getBalance()

            expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitialEthBal))

            const fee = (feePercent / 100) * price
            expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))

            expect(await nft.ownerOf(1)).to.equal(addr2.address)
            expect((await silkRoad.items(1)).sold).to.equal(true)
        })
        it("Should fail for ivalid item ids, sold items and when not enough ether is paid", async function(){
            await expect(silkRoad.connect(addr2).purchaseItem(2, {value: totalPriceInWei}))
            .to.be.revertedWith("Item does not exist")
            await expect(silkRoad.connect(addr2).purchaseItem(0, {value: totalPriceInWei}))
            .to.be.revertedWith("Item does not exist")
            await expect(silkRoad.connect(addr2).purchaseItem(1, {value: toWei(price)}))
            .to.be.revertedWith("Not enough ether to cover item price and market fee")
            await silkRoad.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
            await expect(silkRoad.connect(deployer).purchaseItem(1, {value: totalPriceInWei}))
            .to.be.revertedWith("Item already sold")
        })
    });
})