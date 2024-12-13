// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Poll {
    address public owner;
    bool isClosed;
    string title;
    string description;

    // summary data
    mapping(uint256 => Candidate) candidates;
    mapping(address => Voter) voters;
    address[] votersInArray;
    uint256 totalVotes = 0;
    

    struct Candidate {
        uint256 id;
        uint256 votes;
    }

    struct Voter {
        address wallet;
        bool isVoted;
        uint256 votedTo;
    }


    // events
    event Voted(address indexed user, uint256 candidateId);
    event PollClosed();

    constructor(uint256[] memory candidateIds) {
        owner = msg.sender;

        for (uint i = 0; i < candidateIds.length; i++) {
            candidates[candidateIds[i]] = Candidate({
                id: candidateIds[i],
                votes: 0
            });
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addVoters(address[] memory users) public onlyOwner {
        for (uint i = 0; i < users.length; i++) {
            if (isVoter(users[i])) {
                continue;
            }
            voters[users[i]] = Voter({
                wallet: users[i],
                isVoted: false,
                votedTo: 0
            });
            votersInArray.push(users[i]);
        }
    }

    function getVoters() public view returns (address[] memory) {
        return votersInArray;
    }

    function isVoter(address user) internal view returns (bool) {
        return voters[user].wallet == user;
    }

    function hasVoted(address user) internal view returns (bool) {
        return voters[user].isVoted;
    }

    function isCandidateValid(uint256 candidateId) internal view returns (bool) {
        return candidates[candidateId].id == candidateId;
    }

    function vote(uint256 candidateId) public {
        require(isCandidateValid(candidateId), "Invalid candidate");
        require(!isClosed, "Poll is closed");
        require(isVoter(msg.sender), "You are not allowed to vote");
        require(!hasVoted(msg.sender), "You already voted");
        
        // mark voted
        voters[msg.sender].isVoted = true;

        // save vote
        voters[msg.sender].votedTo = candidateId;

        // save summary
        candidates[candidateId].votes += 1;
        totalVotes += 1;

        emit Voted(msg.sender, candidateId);
    }

 
    function closePoll() public onlyOwner {
        isClosed = true;
        emit PollClosed();
    }

    function getCandidateVotes(uint256 candidateId) public view returns (uint256) {
        require(isCandidateValid(candidateId), "Invalid candidate");
        return candidates[candidateId].votes;
    }

    function getTotalVotes() public view returns (uint256) {
        return totalVotes;
    }

    function isPollClosed() public view returns (bool) {
        return isClosed;
    }
}