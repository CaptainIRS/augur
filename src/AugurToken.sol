// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract AugurToken is ERC20, ERC20Burnable, ERC20Permit, FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    address public linkTokenContract = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address public functionsRouterAddress = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    uint64 public subscriptionId = 3839;
    bytes32 public donId = bytes32("fun-ethereum-sepolia-1");
    string public source = "let a = args[0]";

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
        mapping(uint8 => mapping(address => bytes32)) roundCommitments;
        string[] allSubmissions;
    }

    mapping(uint256 => Contest) public contests;
    uint256 public contestsCount;
    uint256 public currentContest;

    constructor()
        ERC20("AugurToken", "AUG")
        ERC20Permit("AugurToken")
        FunctionsClient(functionsRouterAddress)
        ConfirmedOwner(msg.sender)
    {
        contestsCount = 0;
        _mint(msg.sender, 1000000000);
    }

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
        require(balanceOf(msg.sender) >= totalReward, "Insufficient balance");

        transfer(address(this), totalReward);

        uint256 contestID = contestsCount++;
        Contest storage contest = contests[contestID];
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
        bytes32 commitment
    );
    event RoundForfeited(uint256 indexed contestID, uint8 indexed round);

    function submit(uint256 contestID, uint256 submission, bytes32 commitment) public {
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

        require(contest.roundCommitments[contest.currentRound][msg.sender] != 0, "Duplicate submission");
        require(
            keccak256(abi.encode(submission)) == contest.roundCommitments[contest.currentRound - 1][msg.sender],
            "Invalid submission"
        );
        contest.roundSubmissions[contest.currentRound - 1][msg.sender] = submission;
        contest.roundCommitments[contest.currentRound][msg.sender] = commitment;

        contest.allSubmissions.push(
            string.concat(
                Strings.toString(contest.currentRound - 1),
                ",",
                Strings.toHexString(msg.sender),
                ",",
                Strings.toString(submission)
            )
        );

        emit Submission(contestID, msg.sender, contest.currentRound, submission, commitment);
    }

    event RoundEnded(uint256 indexed contestID, uint8 indexed round);

    function endRound(uint256 contestID, uint256 target) external {
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

        if (contest.currentRound == contest.totalRounds + 1) {
            currentContest = contestID;
            contest.allSubmissions.push(Strings.toString(target));
            _executeRequest(contest.allSubmissions);
        }
    }

    function _executeRequest(string[] memory args) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequest(FunctionsRequest.Location.Inline, FunctionsRequest.CodeLanguage.JavaScript, source);
        if (args.length > 0) req.setArgs(args);
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, 100000, donId);
    }

    function fulfillRequest(bytes32, /*requestId*/ bytes memory response, bytes memory /*err*/ ) internal override {
        address[] memory responseDecoded = abi.decode(response, (address[]));
        for (uint256 i = 0; i < responseDecoded.length; i++) {
            transfer(responseDecoded[i], contests[currentContest].totalReward / responseDecoded.length);
        }
    }

    function setSource(string memory _source) public onlyOwner {
        source = _source;
    }

    function grantTokens(address to, uint256 amount) public onlyOwner {
        transfer(to, amount);
    }
}
