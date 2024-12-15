// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Poll {
    address public owner;
    string title;
    string description;
    uint256[] optionVotes;
    uint256 totalVotes = 0;
    bool isClosed;

    // summary data
    mapping(address => Voter) voters;
    address[] votersInArray;

    // for checking voting option is valid
    uint8 optionCount;

    
    struct Stats {
        uint256[] optionVotes;
        uint256 totalVotes;
        bool isClosed;
        bool isVoted;
    }

    struct Voter {
        address wallet;
        uint8 votedTo;
    }


    // events
    event Voted(uint256 totalVotes, uint256[] optionVotes);
    event PollClosed();

    constructor(uint8 _optionCount) {
        owner = msg.sender;
        optionVotes = new uint256[](_optionCount);
        optionCount = _optionCount;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // function addVoters(address[] memory users) public onlyOwner {
    //     for (uint i = 0; i < users.length; i++) {
    //         if (isVoter(users[i])) {
    //             continue;
    //         }
    //         // voters[users[i]] = Voter({
    //         //     wallet: users[i],
    //         //     isVoted: false,
    //         //     votedTo: 0
    //         // });
    //         votersInArray.push(users[i]);
    //     }
    // }

    // function getVoters() public view returns (address[] memory) {
    //     return votersInArray;
    // }

    // option initlization
    function isOptionValid(uint8 order) internal view returns (bool) {
        return order >= 0 && order < optionCount;
    }

    // function isVoter(address user) internal view returns (bool) {
    //     return voters[user].wallet == user;
    // }

    function hasVoted(address user) public view returns (bool) {
        // NOTE: to be confirm if user vote to first option
        return voters[user].votedTo != 0;
    }


    function vote(uint8 optionOrder) public {
        require(isOptionValid(optionOrder), "Invalid option");
        require(!isClosed, "Poll is closed");
        // NOTE: future will implemented as whitelist
        // require(isVoter(msg.sender), "You are not allowed to vote");
        require(!hasVoted(msg.sender), "You already voted");
        
        // mark voted
        voters[msg.sender].votedTo = optionOrder;

        // save summary for client
        
        optionVotes[optionOrder]++;
        totalVotes += 1;

        emit Voted(totalVotes, optionVotes);
    }

 
    function closePoll() public onlyOwner {
        isClosed = true;
        emit PollClosed();
    }

    function getStats(address user) public view returns (Stats memory) {
        return Stats({
            optionVotes: optionVotes,
            totalVotes: totalVotes,
            isClosed: isClosed,
            isVoted: hasVoted(user)
        });
    }
}