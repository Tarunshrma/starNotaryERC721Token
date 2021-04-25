const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async () => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar(tokenId, 'Awesome Star!', { from: accounts[0] })
    assert.equal(await instance.starToTokenIdMapping.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar(starId, 'awesome star', { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starToPriceMapping.call(starId), starPrice);
});


it('Check the user1 balance after star owned by him is bought.. his balance should increase', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[3];
    let tokenId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

    //First create a star and assign it to user1
    await instance.createStar(tokenId, "test star", { from: user1 });
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });

    assert.equal(await instance.ownerOf.call(tokenId), user1);

    let balanceBeforeStarIsBought = await web3.eth.getBalance(user1);
    await instance.buyStar(tokenId, { from: user2, value: balance })

    let balanceAfterStarIsBought = await web3.eth.getBalance(user1);

    let value1 = Number(balanceBeforeStarIsBought) + Number(starPrice);
    let value2 = Number(balanceAfterStarIsBought);
    assert.equal(value1, value2);
});

it('Check if owner is changed after transaction', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let tokenId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

    //First create a star and assign it to user1
    await instance.createStar(tokenId, "test star", { from: user1 });
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });

    await instance.buyStar(tokenId, { from: user2, value: balance })

    let newOwner = await instance.ownerOf(tokenId);

    assert.equal(user2, newOwner);
});


it('Lookup for star', async () => {
    let tokenId = 10;
    let instance = await StarNotary.deployed();
    await instance.createStar(tokenId, 'Test Star1', { from: accounts[0] })

    let lookUpStar = await instance.lookUptokenIdToStarInfo(tokenId);

    assert.equal(await lookUpStar, 'Test Star1')
});

it('Exchange Stars', async () => {
    let token1Id = 11;
    let account1 = accounts[0]

    let token2Id = 12;
    let account2 = accounts[1]


    let instance = await StarNotary.deployed();

    //Create token 1 from accont 1 as owner
    await instance.createStar(token1Id, 'Token 1', { from: account1 })

    //Create token 2 from accont 2 as owner
    await instance.createStar(token2Id, 'Token 2', { from: account2 })
    
    //Check ownership before exchanging
    assert.equal(account1, await instance.ownerOf(token1Id));
    assert.equal(account2, await instance.ownerOf(token2Id));

    //Exchange the starts
    instance.exchangeStars(token1Id,token2Id,{from: account1});

    //Verify Ownership should have been changed now
    assert.equal(account1, await instance.ownerOf(token2Id));
    assert.equal(account2, await instance.ownerOf(token1Id));
});

it('Transfer Star to Other Address', async () => {
    let token1Id = 13;
    let account1 = accounts[0]

    let account2 = accounts[1]

    let instance = await StarNotary.deployed();

    //Create token  from accont 1 as owner
    await instance.createStar(token1Id, 'Token 1', { from: account1 })

    
    //Check ownership before transfer
    assert.equal(account1, await instance.ownerOf(token1Id));

    //Exchange the starts
    instance.transferStar(account2,token1Id,{from: account1});

    //Verify Ownership should have been changed now
    assert.equal(account2, await instance.ownerOf(token1Id));
});