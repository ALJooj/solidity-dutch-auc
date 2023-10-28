const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("AuctionContract", function() {
    let owner
    let seller
    let buyer
    let payment

    beforeEach(async function(){
        [owner, seller, buyer] = await ethers.getSigners()
        const Auction = await ethers.getContractFactory("AuctionContract", owner)
        auct = await Auction.deploy()
        await auct.deployed()
    })
    it("sets owner ", async function(){
        const curOwner = await auct.owner()
        expect(curOwner).to.eq(owner.address)
    })

    async function getTimestamp(bn) {
        return (await ethers.provider.getBlock(bn)).timestamp
    }
    describe("create test", function() {
    })
    it("creates auct ", async function(){
        const tx = await auct.createAuc(
            ethers.utils.parseEther("0.0001"),
            60,
            3,
            "cool NFT"
        )
        const cAuction = await auct.aucArray(0)
        expect(cAuction.item).to.eq("cool NFT")
        const ts = await getTimestamp(tx.blockNumber)
        expect(cAuction.endingAt).to.eq(ts + 60)        
    })

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    describe("buy", function() {
    })
    it("allows to buy ", async function(){
        await auct.connect(seller).createAuc(
            ethers.utils.parseEther("0.0001"),
            60,
            3,
            "cool NFT"
        )

        this.timeout(5000)
        await delay(1000)
        
        const buyTx = await auct.connect(buyer)
        .buyItem(0, {
            value: ethers.utils.parseEther("0.0001"),
        })
        const cAuction = await auct.aucArray(0)
        const fPrice = cAuction.finalPrice

        await expect(()=> buyTx).
        to.changeEtherBalance(
            seller, fPrice - Math.floor((fPrice * 10)/100)
            )
    })
    describe("withdraw", function() {
    })
    it("sends fee", async function(){
        await auct.connect(seller).createAuc(
            ethers.utils.parseEther("0.0001"),
            60,
            3,
            "cool NFT"
        )
        this.timeout(5000)
        await delay(3000)
        const buyTx = await auct.connect(buyer)
        .buyItem(0, {
            value: ethers.utils.parseEther("0.0001"),
        })

        const cAuction = await auct.aucArray(0)
        const fPrice = cAuction.finalPrice

        const wTx = auct.connect(owner).withdraw()
        await expect(()=> wTx).
        to.changeEtherBalance(owner, Math.floor((fPrice * 10)/100))
    })
})