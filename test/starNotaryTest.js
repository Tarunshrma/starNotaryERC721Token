const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar(tokenId,'Awesome Star!', {from: accounts[0]})
    assert.equal(await instance.starToTokenIdMapping.call(tokenId), 'Awesome Star!')
});


it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar(starId, 'awesome star', {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starToPriceMapping.call(starId), starPrice);
});


it('Check the user1 balance after star owned by him is bought.. his balance should increase', async() =>{
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[3];
    let tokenId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

    //First create a star and assign it to user1
    await instance.createStar(tokenId,"test star",{from: user1});
    await instance.putStarUpForSale(tokenId,starPrice ,{from: user1});

    assert.equal(await instance.ownerOf.call(tokenId), user1);    

    let balanceBeforeStarIsBought = await web3.eth.getBalance(user1);
    await instance.buyStar(tokenId, {from: user2, value: balance})

    let balanceAfterStarIsBought = await web3.eth.getBalance(user1);

    let value1 = Number(balanceBeforeStarIsBought) + Number(starPrice);
    let value2 = Number(balanceAfterStarIsBought);
    assert.equal(value1, value2);
});

it('Check if owner is changed after transaction', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

     //First create a star and assign it to user1
     await instance.createStar(tokenId,"test star",{from: user1});
     await instance.putStarUpForSale(tokenId,starPrice ,{from: user1});

     await instance.buyStar(tokenId, {from: user2, value: balance})

     let newOwner =  await instance.ownerOf(tokenId);

     assert.equal(user2,newOwner);
});

//lets user1 get the funds after the sale

//lets user2 buy a star, if it is put up for sale

