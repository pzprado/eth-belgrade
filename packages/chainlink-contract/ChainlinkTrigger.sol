// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChainlinkTrigger {
    address public admin;
    uint64 public subscriptionId;
    address public chainlinkRouter;
    bytes32 public donId;
    uint32 public gasLimit;
    uint256 public sentimentThreshold;

    event SentimentAlertTriggered(string appName, uint256 overallSentimentScore, string surveyProjectId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _router, uint64 _subId, bytes32 _donId, uint32 _gasLimit, uint256 _threshold) {
        admin = msg.sender;
        chainlinkRouter = _router;
        subscriptionId = _subId;
        donId = _donId;
        gasLimit = _gasLimit;
        sentimentThreshold = _threshold;
    }

    function triggerSentimentAlert(string memory appName, uint256 overallSentimentScore, string memory surveyProjectId)
        external
        onlyAdmin
    {
        require(overallSentimentScore < sentimentThreshold, "Score not low enough");
        // In a real implementation, build and send Chainlink Functions request here
        emit SentimentAlertTriggered(appName, overallSentimentScore, surveyProjectId);
    }

    function setThreshold(uint256 _threshold) external onlyAdmin {
        sentimentThreshold = _threshold;
    }
}
