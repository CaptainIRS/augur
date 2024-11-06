# -include lib/foundry-chainlink-toolkit/makefile-utility
-include lib/foundry-chainlink-toolkit/makefile-external
-include lib/foundry-chainlink-toolkit/makefile-sandbox
# include makefile-external
# include makefile-internal
# include makefile-sandbox

.PHONY: deploy script

deploy:
	forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/AugurToken.sol:AugurToken

script:
	forge script script/AugurToken.s.sol --sig "getAllowListId()" --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --out /tmp/out/

fct-functions-create-subscription-with-consumer: fct-check-rpc-url
	$(call check_defined, PRIVATE_KEY) \
	$(call check_set_parameter,FUNCTIONS_ROUTER_ADDRESS,functionsRouterAddress) \
	forge script ${FCT_PLUGIN_PATH}/script/functions/Functions.CLI.s.sol --sig "createSubscriptionWithConsumer(address, address)" $$functionsRouterAddress 0xA4899D35897033b927acFCf422bc745916139776 --rpc-url ${RPC_URL} --broadcast --private-key ${PRIVATE_KEY} --out ${FCT_PLUGIN_PATH}/out

fct-anvil-trace:  ## Run Anvil
	anvil --steps-tracing --block-time 10 --chain-id 1337 -m 'test test test test test test test test test test test junk'