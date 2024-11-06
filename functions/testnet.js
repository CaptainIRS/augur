const {
    LinkTokenSource,
    MockV3AggregatorSource,
    FunctionsRouterSource,
    FunctionsCoordinatorSource,
    FunctionsCoordinatorTestHelperSource,
    TermsOfServiceAllowListSource,
} = require('@chainlink/functions-toolkit/dist/v1_contract_sources');

const simulatedLinkEthPrice = BigInt('6000000000000000')
const simulatedLinkUsdPrice = BigInt('1500000000')

const simulatedDonId = 'local-functions-testnet'

const simulatedAllowListId = 'allowlist'

const simulatedRouterConfig = {
    maxConsumersPerSubscription: 100,
    adminFee: 0,
    handleOracleFulfillmentSelector: '0x0ca76175', // handleOracleFulfillment(bytes32 requestId, bytes memory response, bytes memory err)
    gasForCallExactCheck: 5000,
    maxCallbackGasLimits: [300_000, 500_000, 1_000_000],
    subscriptionDepositMinimumRequests: 0,
    subscriptionDepositJuels: 0,
}

const simulatedCoordinatorConfig = {
    maxCallbackGasLimit: 1_000_000,
    feedStalenessSeconds: 86_400,
    gasOverheadBeforeCallback: 44_615,
    gasOverheadAfterCallback: 44_615,
    requestTimeoutSeconds: 0, // 300 is used on actual mainnet & testnet blockchains
    donFeeCentsUsd: 0,
    maxSupportedRequestDataVersion: 1,
    fulfillmentGasPriceOverEstimationBP: 0,
    fallbackNativePerUnitLink: BigInt('5000000000000000'),
    minimumEstimateGasPriceWei: 1000000000, // 1 gwei
    fallbackUsdPerUnitLink: 1400000000,
    fallbackUsdPerUnitLinkDecimals: 8,
    operationFeeCentsUsd: 0,
}

const simulatedAllowListConfig = {
    enabled: false,
    signerPublicKey: '0x0000000000000000000000000000000000000000',
}

const callReportGasLimit = 5_000_000

const numberOfSimulatedNodeExecutions = 4

const simulatedWallets = {
    node0: {
        address: '0xAe24F6e7e046a0C764DF51F333dE5e2fE360AC72',
        privateKey: '0x493f20c367e9c5190b14b8071a6c765da973d41428b841c25e4aaba3577f8ece',
    },
    node1: {
        address: '0x37d7bf16f6fd8c37b766Fa87e047c68c51dfdf4a',
        privateKey: '0x7abd90843922984dda18358a179679e5cabda5ad8d0ebab5714ac044663a6a14',
    },
    node2: {
        address: '0x6e7EF53D9811B70834902D2D9137DaD2720eAC47',
        privateKey: '0xcb8801121add786869aac78ceb4003bf3aa8a68ae8dd31f80d61f5f98eace3c5',
    },
    node3: {
        address: '0xBe83eA9868AE964f8C46EFa0fea798EbE16441c5',
        privateKey: '0x06c7ca21f24edf450251e87097264b1fd184c9570084a78aa3300e937e1954b8',
    },
}

const simulatedTransmitters = Object.values(simulatedWallets).map(wallet => wallet.address)

const simulatedSecretsKeys = {
    thresholdKeys: {
        publicKey:
            '{"Group":"P256","G_bar":"BLCl28PjjGt8JyL/p6AHToD6265gEBfl12mBiCVZShSPHVwvx5GwJ0QMqpQ7yPZEM8E6U015XFHvsDuq8X/S/c8=","H":"BEDshIeMEgr2kjNdjkG12M0A9P0uwg5Hl7jbKjbIcweHi07tu8rITgMZ9dTfqLhtFu+cRwwZaLLZdhqdg1JyLYY=","HArray":["BCj9afGghnfy3Nubj7onMPkApbF9r4GbLvSSi1wrQ1uMwRYMr6DCt5RCm95vKx75JPuOFdKBkBTOpX4p5Dtt0l0=","BJCmC0+jkl/WTK8sfb6ulQjBWTZnQEasPRVdCIYv94RkZWfVk6CbFS2Dv9C090He4UaYBaOGGyw7HGAtqKUqX1Y=","BPPnFxrq+9VI8Bb6KUBJalt/EZdU+G/l4iyosvB5bulwWDxJ26mw3hJZtZfjUcJPGIajabNFOa+5pVBd6Y3oGB8=","BJ1tWD2RhKB/uQEJ1x54mBddAW0KoFghplSswp/F3BYksyZIRIhEiLDsNgw3NfhmQh2OR6Vgv4APqAt9+RKxzzk="]}',
        privateKeyShares: {
            '0xAe24F6e7e046a0C764DF51F333dE5e2fE360AC72':
                '{"Group":"P256","Index":0,"V":"XuDZcsMc5ebjgbHx+zQ/Hhbwn24MgJ5oBL+ORQGqM8c="}',
            '0x37d7bf16f6fd8c37b766Fa87e047c68c51dfdf4a':
                '{"Group":"P256","Index":1,"V":"x3UbVxPoPQvRTL6ILjuBSGep3UUPY2q7j6LjHR2tU2A="}',
            '0x6e7EF53D9811B70834902D2D9137DaD2720eAC47':
                '{"Group":"P256","Index":2,"V":"MAldPGSzlC+/F8seYULDcvt8IG5rLpiKJsxtMj1NTag="}',
            '0xBe83eA9868AE964f8C46EFa0fea798EbE16441c5':
                '{"Group":"P256","Index":3,"V":"mJ2fILV+61Ss4te0lEoFnUw1XkVuEWTdsa/CCllQbUE="}',
        },
    },
    donKey: {
        publicKey:
            '0x46e62235e8ac8a4f84aa62baf7c67d73a23c5641821bab8d24a161071b90ed8295195d81ba34e4492f773c84e63617879c99480a7d9545385b56b5fdfd88d0da',
        privateKey: '0x32d6fac6ddc22adc2144aa75de175556c0095b795cb1bc7b2a53c8a07462e8e3',
    },
}

const DEFAULT_MAX_ON_CHAIN_RESPONSE_BYTES = 256
const DEFAULT_MAX_EXECUTION_DURATION_MS = 10_000 // 10 seconds
const DEFAULT_MAX_MEMORY_USAGE_MB = 128
const DEFAULT_MAX_HTTP_REQUESTS = 5
const DEFAULT_MAX_HTTP_REQUEST_DURATION_MS = 9_000 // 9 seconds
const DEFAULT_MAX_HTTP_REQUEST_URL_LENGTH = 2048 // 2 KB
const DEFAULT_MAX_HTTP_REQUEST_BYTES = 2048 // 2 KB
const DEFAULT_MAX_HTTP_RESPONSE_BYTES = 2_097_152 // 2 MB

const { Wallet, Contract, ContractFactory, utils, providers } = require('ethers');
const cbor = require('cbor');

const startLocalFunctionsTestnet = async (
    simulationConfigPath,
    options,
    port = 8545,
) => {
    const admin = new Wallet(
        process.env.PRIVATE_KEY.slice(2),
        new providers.JsonRpcProvider(`http://0.0.0.0:${port}`),
    )

    const contracts = await deployFunctionsOracle(admin)
    console.log('Deployed Functions Oracle contracts')

    contracts.functionsMockCoordinatorContract.on(
        'OracleRequest',
        (
            requestId,
            requestingContract,
            requestInitiator,
            subscriptionId,
            subscriptionOwner,
            data,
            dataVersion,
            flags,
            callbackGasLimit,
            commitment,
        ) => {
            const requestEvent = {
                requestId,
                requestingContract,
                requestInitiator,
                subscriptionId,
                subscriptionOwner,
                data,
                dataVersion,
                flags,
                callbackGasLimit,
                commitment,
            }
            handleOracleRequest(
                requestEvent,
                contracts.functionsMockCoordinatorContract,
                admin,
                simulationConfigPath,
            )
        },
    )

    const getFunds = async (address, { weiAmount, juelsAmount }) => {
        if (!juelsAmount) {
            juelsAmount = BigInt(0)
        }
        if (!weiAmount) {
            weiAmount = BigInt(0)
        }
        if (typeof weiAmount !== 'string' && typeof weiAmount !== 'bigint') {
            throw Error(`weiAmount must be a BigInt or string, got ${typeof weiAmount}`)
        }
        if (typeof juelsAmount !== 'string' && typeof juelsAmount !== 'bigint') {
            throw Error(`juelsAmount must be a BigInt or string, got ${typeof juelsAmount}`)
        }
        weiAmount = BigInt(weiAmount)
        juelsAmount = BigInt(juelsAmount)
        const ethTx = await admin.sendTransaction({
            to: address,
            value: weiAmount.toString(),
        })
        const linkTx = await contracts.linkTokenContract.connect(admin).transfer(address, juelsAmount)
        await ethTx.wait(1)
        await linkTx.wait(1)
        console.log(
            `Sent ${utils.formatEther(weiAmount.toString())} ETH and ${utils.formatEther(
                juelsAmount.toString(),
            )} LINK to ${address}`,
        )
    }

    const close = async () => {
        contracts.functionsMockCoordinatorContract.removeAllListeners('OracleRequest')
    }

    return {
        adminWallet: {
            address: admin.address,
            privateKey: admin.privateKey,
        },
        ...contracts,
        getFunds,
        close,
    }
}

const handleOracleRequest = async (
    requestEventData,
    mockCoordinator,
    admin,
    simulationConfigPath,
) => {
    const response = await simulateDONExecution(requestEventData, simulationConfigPath)

    const errorHexstring = response.errorString
        ? '0x' + Buffer.from(response.errorString.toString()).toString('hex')
        : undefined
    const encodedReport = encodeReport(
        requestEventData.requestId,
        requestEventData.commitment,
        response.responseBytesHexstring,
        errorHexstring,
    )

    const reportTx = await mockCoordinator
        .connect(admin)
        .callReport(encodedReport, { gasLimit: callReportGasLimit })
    await reportTx.wait(1)
}

const simulateDONExecution = async (
    requestEventData,
    simulationConfigPath,
) => {
    console.log('Simulating DON execution')
    let requestData
    try {
        requestData = await buildRequestObject(requestEventData.data)
    } catch {
        return {
            errorString: 'CBOR parsing error',
        }
    }

    const simulationConfig = simulationConfigPath ? require(simulationConfigPath) : {}

    // Perform the simulation numberOfSimulatedNodeExecution times
    const simulations = [...Array(numberOfSimulatedNodeExecutions)].map(async () => {
        try {
            return await simulateScript({
                source: requestData.source,
                secrets: simulationConfig.secrets, // Secrets are taken from simulationConfig, not request data included in transaction
                args: requestData.args,
                bytesArgs: requestData.bytesArgs,
                maxOnChainResponseBytes: simulationConfig.maxOnChainResponseBytes,
                maxExecutionTimeMs: simulationConfig.maxExecutionTimeMs,
                maxMemoryUsageMb: simulationConfig.maxMemoryUsageMb,
                numAllowedQueries: simulationConfig.numAllowedQueries,
                maxQueryDurationMs: simulationConfig.maxQueryDurationMs,
                maxQueryUrlLength: simulationConfig.maxQueryUrlLength,
                maxQueryRequestBytes: simulationConfig.maxQueryRequestBytes,
                maxQueryResponseBytes: simulationConfig.maxQueryResponseBytes,
            })
        } catch (err) {
            const errorString = err?.message.slice(
                0,
                simulationConfig.maxOnChainResponseBytes ?? DEFAULT_MAX_ON_CHAIN_RESPONSE_BYTES,
            )
            return {
                errorString,
                capturedTerminalOutput: '',
            }
        }
    })
    const responses = await Promise.all(simulations)

    const successfulResponses = responses.filter(response => response.errorString === undefined)
    const errorResponses = responses.filter(response => response.errorString !== undefined)

    if (successfulResponses.length > errorResponses.length) {
        return {
            responseBytesHexstring: aggregateMedian(
                successfulResponses.map(response => response.responseBytesHexstring),
            ),
        }
    } else {
        return {
            errorString: aggregateModeString(errorResponses.map(response => response.errorString)),
        }
    }
}

const aggregateMedian = (responses) => {
    const bufResponses = responses.map(response => Buffer.from(response.slice(2), 'hex'))

    bufResponses.sort((a, b) => {
        if (a.length !== b.length) {
            return a.length - b.length
        }
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return a[i] - b[i]
            }
        }
        return 0
    })

    return '0x' + bufResponses[Math.floor((bufResponses.length - 1) / 2)].toString('hex')
}

const aggregateModeString = (items) => {
    const counts = new Map()

    for (const str of items) {
        const existingCount = counts.get(str) || 0
        counts.set(str, existingCount + 1)
    }

    let modeString = items[0]
    let maxCount = counts.get(modeString) || 0

    for (const [str, count] of counts.entries()) {
        if (count > maxCount) {
            maxCount = count
            modeString = str
        }
    }

    return modeString
}

const encodeReport = (
    requestId,
    commitment,
    result,
    error,
) => {
    const encodedCommitment = utils.defaultAbiCoder.encode(
        [
            'bytes32',
            'address',
            'uint96',
            'address',
            'uint64',
            'uint32',
            'uint72',
            'uint72',
            'uint40',
            'uint40',
            'uint32',
        ],
        [
            commitment.requestId,
            commitment.coordinator,
            commitment.estimatedTotalCostJuels,
            commitment.client,
            commitment.subscriptionId,
            commitment.callbackGasLimit,
            commitment.adminFee,
            commitment.donFee,
            commitment.gasOverheadBeforeCallback,
            commitment.gasOverheadAfterCallback,
            commitment.timeoutTimestamp,
        ],
    )
    const encodedReport = utils.defaultAbiCoder.encode(
        ['bytes32[]', 'bytes[]', 'bytes[]', 'bytes[]', 'bytes[]'],
        [[requestId], [result ?? []], [error ?? []], [encodedCommitment], [[]]],
    )
    return encodedReport
}

const buildRequestObject = async (
    requestDataHexString,
) => {
    const decodedRequestData = await cbor.decodeAll(Buffer.from(requestDataHexString.slice(2), 'hex'))

    if (typeof decodedRequestData[0] === 'object') {
        if (decodedRequestData[0].bytesArgs) {
            decodedRequestData[0].bytesArgs = decodedRequestData[0].bytesArgs?.map((bytesArg) => {
                return '0x' + bytesArg?.toString('hex')
            })
        }
        decodedRequestData[0].secrets = undefined
        return decodedRequestData[0]
    }
    const requestDataObject = {}
    // The decoded request data is an array of alternating keys and values, therefore we can iterate over it in steps of 2
    for (let i = 0; i < decodedRequestData.length - 1; i += 2) {
        const requestDataKey = decodedRequestData[i]
        const requestDataValue = decodedRequestData[i + 1]
        switch (requestDataKey) {
            case 'codeLocation':
                requestDataObject.codeLocation = requestDataValue
                break
            case 'secretsLocation':
                // Unused as secrets provided as an argument to startLocalFunctionsTestnet() are used instead
                break
            case 'language':
                requestDataObject.codeLanguage = requestDataValue
                break
            case 'source':
                requestDataObject.source = requestDataValue
                break
            case 'secrets':
                // Unused as secrets provided as an argument to startLocalFunctionsTestnet() are used instead
                break
            case 'args':
                requestDataObject.args = requestDataValue
                break
            case 'bytesArgs':
                requestDataObject.bytesArgs = requestDataValue?.map((bytesArg) => {
                    return '0x' + bytesArg?.toString('hex')
                })
                break
            default:
            // Ignore unknown keys
        }
    }

    return requestDataObject
}

const deployFunctionsOracle = async (deployer) => {
    const linkTokenFactory = new ContractFactory(
        LinkTokenSource.abi,
        LinkTokenSource.bytecode,
        deployer,
    )
    const linkToken = await linkTokenFactory.connect(deployer).deploy()
    console.log(`Deployed LINK token contract at ${linkToken.address}`)

    const linkPriceFeedFactory = new ContractFactory(
        MockV3AggregatorSource.abi,
        MockV3AggregatorSource.bytecode,
        deployer,
    )
    const linkEthPriceFeed = await linkPriceFeedFactory
        .connect(deployer)
        .deploy(18, simulatedLinkEthPrice)
    console.log(`Deployed LINK/ETH price feed contract at ${linkEthPriceFeed.address}`)
    const linkUsdPriceFeed = await linkPriceFeedFactory
        .connect(deployer)
        .deploy(8, simulatedLinkUsdPrice)
    console.log(`Deployed LINK/USD price feed contract at ${linkUsdPriceFeed.address}`)

    const routerFactory = new ContractFactory(
        FunctionsRouterSource.abi,
        FunctionsRouterSource.bytecode,
        deployer,
    )
    const router = await routerFactory
        .connect(deployer)
        .deploy(linkToken.address, simulatedRouterConfig)
    console.log(`Deployed Functions Router contract at ${router.address}`)

    const mockCoordinatorFactory = new ContractFactory(
        FunctionsCoordinatorSource.abi,
        FunctionsCoordinatorSource.bytecode,
        deployer,
    )
    const mockCoordinator = await mockCoordinatorFactory
        .connect(deployer)
        .deploy(
            router.address,
            simulatedCoordinatorConfig,
            linkEthPriceFeed.address,
            linkUsdPriceFeed.address,
        )
    console.log(`Deployed Functions Coordinator contract at ${mockCoordinator.address}`)

    const allowlistFactory = new ContractFactory(
        TermsOfServiceAllowListSource.abi,
        TermsOfServiceAllowListSource.bytecode,
        deployer,
    )
    const initialAllowedSenders = []
    const initialBlockedSenders = []
    const allowlist = await allowlistFactory
        .connect(deployer)
        .deploy(simulatedAllowListConfig, initialAllowedSenders, initialBlockedSenders)
    console.log(`Deployed Allowlist contract at ${allowlist.address}`)

    const setAllowListIdTx = await router.setAllowListId(
        utils.formatBytes32String(simulatedAllowListId),
    )
    await setAllowListIdTx.wait(1)

    const allowlistId = await router.getAllowListId()
    const proposeContractsTx = await router.proposeContractsUpdate(
        [allowlistId, utils.formatBytes32String(simulatedDonId)],
        [allowlist.address, mockCoordinator.address],
        {
            gasLimit: 1_000_000,
        },
    )
    await proposeContractsTx.wait(1)
    await router.updateContracts({ gasLimit: 1_000_000 })
    console.log(router.address, await router.getProposedContractSet());

    await mockCoordinator.connect(deployer).setDONPublicKey(simulatedSecretsKeys.donKey.publicKey)
    await mockCoordinator
        .connect(deployer)
        .setThresholdPublicKey(
            '0x' + Buffer.from(simulatedSecretsKeys.thresholdKeys.publicKey).toString('hex'),
        )

    return {
        donId: simulatedDonId,
        linkTokenContract: linkToken,
        functionsRouterContract: router,
        functionsMockCoordinatorContract: mockCoordinator,
    }
}

module.exports = {
    startLocalFunctionsTestnet,
}
