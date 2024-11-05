// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {FunctionsClient} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract AugurToken is ERC20, ERC20Burnable, ERC20Permit, FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    struct Contest {
        address organizer;
        uint256 metadata;
        uint256 totalReward;
        uint8 rewardThreshold;
        uint256 startTime;
        uint256 roundDuration;
        uint8 totalRounds;
        uint8 currentRound;
        mapping(address => uint64) participantRewards;
        mapping(uint8 => mapping(address => uint256)) roundSubmissions;
        mapping(uint8 => mapping(address => uint256)) roundCommitments;
    }

    Contest[] public contests;

    constructor(address router)
        ERC20("AugurToken", "AUG")
        ERC20Permit("AugurToken")
        FunctionsClient(router)
        ConfirmedOwner(msg.sender)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    event ContestCreated(uint256 indexed contestID, uint256 metadata);

    function createContest(
        uint256 metadata,
        uint256 totalReward,
        uint8 rewardThreshold,
        uint256 startTime,
        uint256 roundDuration,
        uint8 totalRounds
    ) public {
        require(rewardThreshold > 0, "rewardThreshold must be greater than 0");
        require(totalRounds > 0, "totalRounds must be greater than 0");
        require(startTime > block.timestamp, "startTime must be in the future");

        uint256 contestID = contests.length;
        Contest storage contest = contests.push();
        contest.organizer = msg.sender;
        contest.metadata = metadata;
        contest.totalReward = totalReward;
        contest.rewardThreshold = rewardThreshold;
        contest.startTime = startTime;
        contest.roundDuration = roundDuration;
        contest.totalRounds = totalRounds;
        contest.currentRound = 1;

        emit ContestCreated(contestID, metadata);
    }

    event ParticipantJoined(uint256 indexed contestID, address indexed participant);

    function participate(uint256 contestID) public {
        Contest storage contest = contests[contestID];
        contest.participantRewards[msg.sender] = 0;

        emit ParticipantJoined(contestID, msg.sender);
    }

    event Submission(
        uint256 indexed contestID,
        address indexed participant,
        uint8 indexed round,
        uint256 submission,
        uint256 commitment
    );
    event RoundForfeited(uint256 indexed contestID, uint8 indexed round);

    function submit(uint256 contestID, uint256 submission, uint256 commitment) public {
        Contest storage contest = contests[contestID];

        require(block.timestamp <= contest.startTime, "Contest has not started yet");

        uint256 currentRoundEndTime = contest.startTime + contest.roundDuration * contest.currentRound;
        uint256 currentRoundStartTime = currentRoundEndTime - contest.roundDuration;
        require(currentRoundStartTime <= block.timestamp, "Round has not started yet");
        while (currentRoundEndTime < block.timestamp) {
            emit RoundForfeited(contestID, contest.currentRound);
            contest.currentRound++;
            currentRoundEndTime += contest.roundDuration;
            currentRoundStartTime += contest.roundDuration;
            require(contest.currentRound <= contest.totalRounds + 1, "Contest has ended");
        }
        contest.roundSubmissions[contest.currentRound - 1][msg.sender] = submission;
        contest.roundCommitments[contest.currentRound][msg.sender] = commitment;

        emit Submission(contestID, msg.sender, contest.currentRound, submission, commitment);
    }

    event RoundEnded(uint256 indexed contestID, uint8 indexed round);

    function endRound(uint256 contestID, uint256 target) external onlyOwner {
        Contest storage contest = contests[contestID];
        require(msg.sender == contest.organizer, "Only the organizer can end a round");
        require(block.timestamp > contest.startTime, "Contest has not started yet");

        uint256 currentRoundEndTime = contest.startTime + contest.roundDuration * contest.currentRound;
        uint256 currentRoundStartTime = currentRoundEndTime - contest.roundDuration;
        require(currentRoundStartTime <= block.timestamp, "Round has not started yet");
        while (currentRoundEndTime < block.timestamp) {
            emit RoundForfeited(contestID, contest.currentRound);
            contest.currentRound++;
            currentRoundEndTime += contest.roundDuration;
            currentRoundStartTime += contest.roundDuration;
            require(contest.currentRound <= contest.totalRounds + 1, "Contest has ended");
        }
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        revert("Not implemented");
    }
}
