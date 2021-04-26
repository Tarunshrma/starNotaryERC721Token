pragma solidity >=0.4.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    //Star struct type
    struct Star {
        string name;
    }

    //Mapping to store star info against token id
    mapping(uint256 => Star) public starToTokenIdMapping;

    //Mapping to store stars up for sale with associated price
    mapping(uint256 => uint256) public starToPriceMapping;

    //Task1: Added NFT Token & Symbol in constructor.
    constructor() ERC721("MyStars", "TS") {
        
    }

    //This function will create a new star and assign the ownership to caller using mint
    function createStar(uint256 _tokenId, string memory _starName) public {
        require(
            _tokenId > 0 && bytes(_starName).length > 0,
            "Provide valid information to add the star"
        );
        Star memory newStar = Star(_starName);
        starToTokenIdMapping[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    //Add a star to up for sale mapping and assign the price to it.
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You should own the star to put it on sale"
        );
        starToPriceMapping[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    //Buy the star
    function buyStar(uint256 _tokenId) public payable {
        //Check if token if exist or star is up for sale
        require(
            starToPriceMapping[_tokenId] > 0,
            "Star is not up for sale, please check if star information is correct"
        );

        uint256 amountPaying = msg.value;

        //First check if buyer is providing enough value of star else throw
        uint256 starPrice = starToPriceMapping[_tokenId];
        require(
            amountPaying >= starPrice,
            "Not enough value provided to buy the star"
        );

        address ownerAddress = ownerOf(_tokenId);

        //Transfer the ownership
        _transfer(ownerAddress, msg.sender, _tokenId);

        //Pay the price to owner
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starPrice);

        //if paying price is more then original cost of star then return the balance
        if (amountPaying > starPrice) {
            _make_payable(msg.sender).transfer(amountPaying - starPrice);
        }
    }

    //Task 1: Find the Star detail from token id
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        Star memory star = starToTokenIdMapping[_tokenId];
        string memory starName = star.name;

        require(
            bytes(starName).length > 0,
            "Star you are looking for does not exist."
        );

        return starName;
    }

    //Task1: Exchnage the starts between two users...
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address myAddress = msg.sender;
        address token1Owner = ownerOf(_tokenId1);
        address token2Owner = ownerOf(_tokenId2);

        require(
            token1Owner == myAddress,
            "You can not exchange the star You don't own"
        );
        
        //Give my token to owner of token 2 and takes his token
        _transfer(myAddress, token2Owner, _tokenId1);
        _transfer(token2Owner,myAddress,_tokenId2);
    }

//Task1: Transfer a star to specified address
    function transferStar(address _transferToAddress, uint256 _tokenId) public {
        address myAddress = msg.sender;
        address tokenOwner = ownerOf(_tokenId);

        require(
            tokenOwner == myAddress,
            "You can not transfer the star You don't own"
        );
        
        //Give my token to owner of token 2 and takes his token
        _transfer(myAddress, _transferToAddress, _tokenId);
    }
}
