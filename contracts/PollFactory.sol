// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract PollFactory {
    struct Poll {
        string question;
        string[] options;
        mapping(uint => uint) votes;       // optionIndex => vote count
        mapping(address => bool) hasVoted; // prevents duplicate votes
        bool exists;
    }

    uint public pollCount;
    mapping(uint => Poll) public polls; // Id => Poll struct

    event PollCreated(uint pollId, string question, string[] options);
    event Voted(uint pollId, address voter, uint optionIndex);

    // Creates a poll on the block chain given the question for the poll and an array of its options
    function createPoll(string memory _question, string[] memory _options) public {
        require(_options.length >= 2, "Need at least two options");

        Poll storage newPoll = polls[pollCount];
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.exists = true;

        emit PollCreated(pollCount, _question, _options);
        pollCount++;
    }

    // Given the poll and an option index, the user can choose which option to vote for
    // Handles not letting a user vote more than once on a single poll
    function vote(uint _pollId, uint _optionIndex) public {
        require(_pollId < pollCount, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(!poll.hasVoted[msg.sender], "You already voted");
        require(_optionIndex < poll.options.length, "Invalid option");

        poll.votes[_optionIndex]++;
        poll.hasVoted[msg.sender] = true;

        emit Voted(_pollId, msg.sender, _optionIndex);
    }

    // Get poll information, specifically the poll question and its options
    function getPoll(uint _pollId) public view returns (
        string memory question,
        string[] memory options
    ) {
        require(polls[_pollId].exists, "Poll doesn't exist");
        Poll storage poll = polls[_pollId];
        return (poll.question, poll.options);
    }

    // Get an array of total votes for each option. Votes index corresponds to the option index of the poll
    function getVotes(uint _pollId) public view returns (uint[] memory voteCounts) {
        require(polls[_pollId].exists, "Poll doesn't exist");
        Poll storage poll = polls[_pollId];
        uint[] memory counts = new uint[](poll.options.length);

        for (uint i = 0; i < poll.options.length; i++) {
            counts[i] = poll.votes[i];
        }
        return counts;
    }
}
