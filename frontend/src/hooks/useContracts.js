import { useMemo } from "react";
import { usePrepareContractWrite, useContractWrite } from 'wagmi';

const BadgerAddresses = JSON.parse(process.env.REACT_APP_BADGER_ADDRESSES)
const primaryProdChain = process.env.REACT_APP_PRODUCTION_CHAIN

// Gets the ABI for sash contracts.
export function getBadgerOrganizationAbi() {
    try {
        const abi = require('@abis/BadgerOrganization.json');
        return {abi: abi}
    }
    catch (err) {
        console.error('Error importing BadgerOrganization:', err);
        return {error: err}
    }
}

// Gets the abi and chain specific address for the Badger contract.
export function getBadgerAbi(chainName) {
    try {
        const abi = require('@abis/Badger.json');
        const address = BadgerAddresses[chainName] ? BadgerAddresses[chainName] : BadgerAddresses[primaryProdChain]
        return {
            abi: abi,
            address: address
        }
    }
    catch (err) {
        console.error('Error importing Badger:', err);
        return {error: err}
    }
}

// Creates a new sash contract for an organization.
export const useBadgerPress = (chainName, enabled) => {
    const Badger = useMemo(() => getBadgerAbi(chainName), [chainName]);
    let response = {status: 'ok', message: 'Transaction is ready to call.'};

    const { config } = usePrepareContractWrite({
        addressOrName: Badger.address,
        contractInterface: Badger.abi,
        functionName: "createOrganization",
        args: [""],
        enabled: enabled,
    })

    const { writeAsync } = useContractWrite(config);

    return { write: writeAsync, response };
}

// Creates a badge from a cloned sash contract.
export const useCreateBadge = (badge) => {
    const BadgerOrganization = useMemo(() => getBadgerOrganizationAbi(), []);
    let response = {status: 'ok', message: 'Transaction is ready to call.'};

    // This should also clean/check the addresses as well.
    badge?.delegates?.forEach((delegate, index) => {
        if (delegate === "") {
            badge.delegates.pop(index)
        }
    })

    let args = [
        badge.token_id,
        badge.account_bound,
        badge.signer || "",
        badge.token_uri,
        badge.payment_token || [0, "0x0000000000000000000000000000000000000000", 0, 0],
        badge.delegates || []
    ]

    const { config, isSuccess } = usePrepareContractWrite({
        addressOrName: badge.contract_address,
        contractInterface: BadgerOrganization.abi,
        functionName: "setBadge",
        args: args,
        enabled: Boolean(badge.token_uri),
    })

    const { writeAsync } = useContractWrite(config);

    return { write: writeAsync, response, isSuccess };
}

/* 
    Determines which function to call based on if it is a revoke or a mint,
    if there are multiple badge ids, and if there are multiple holders.
*/
export const useManageBadgeOwnership = (isTxReady, orgAddress, ids, holders, action, amounts) => {
    const BadgerOrganization = useMemo(() => getBadgerOrganizationAbi(), []);
    let response = {status: 'unprepared', message: 'Transaction is not ready to call.'};
    
    // Might look a little funky but cleaner than a switch IMO.
    // If revoke is true, then we check if there is just one holder for a single revoke.
    // If ids is a single id, then we call the revoke function with multiple holders.
    // If ids is an array, then we call revoke with multiple different badges.
    // If revoke is false, same checks but for minting instead of revoke
    const revoke = action === "Revoke" ? true : false
    const method = revoke ? 
        holders.length === 1 ? "revoke" : 
        typeof(ids) === "number" ? "revokeBatch" : "revokeFullBatch"
        :
        holders.length === 1 ? "leaderMint" :
        typeof(ids) === "number" ? "leaderMintBatch" : "leaderMintFullBatch"

    // This should also clean/check the addresses as well.
    holders.forEach((holder, index) => {
        if (holder === "") {
            holders.pop(index)
        }
    })

    // Amounts will need to be changed to be an array of arrays for each badge.
    // For now it's standard for just one.
    amounts = Array(holders.length).fill(amounts)

    if (holders.length === 1) 
        holders = holders[0]

    const args = [
        holders,
        ids,
        amounts,
    ]

    // Contracts currently have bytes data if it's a mint only, not revoke.
    if (!revoke) 
        args.push("0x")

    const { config, isSuccess } = usePrepareContractWrite({
        addressOrName: orgAddress,
        contractInterface: BadgerOrganization.abi,
        functionName: method,
        args: args,
        enabled: isTxReady,
    })

    const { writeAsync } = useContractWrite(config);

    if (isSuccess) 
        response = {status: 'ok', message: 'Transaction is ready to call.'};

    return { write: writeAsync, response, isSuccess };
}

/*
    Changes delegates of badge(s) with id(s) from orgAddress. 
    If revoke is true then delegates are removed.
*/
export const useSetDelegates = (isTxReady, orgAddress, ids, delegates, action) => {
    const BadgerOrganization = useMemo(() => getBadgerOrganizationAbi(), []);
    let response = {status: 'unprepared', message: 'Transaction is not ready to call.'}

    const revoke = action === "Remove Leader" ? true : false
    const isDelegateArray = Array(delegates.length).fill(!revoke);
    const method = typeof(ids) === "number" ?  "setDelegates" : "setDelegatesBatch";

    // This should also clean/check the addresses as well.
    delegates.forEach((delegate, index) => {
        if (delegate === "") {
            delegates.pop(index)
        }
    })

    const args = [
        ids,
        delegates,
        isDelegateArray,
    ]

    const { config, isSuccess } = usePrepareContractWrite({
        addressOrName: orgAddress,
        contractInterface: BadgerOrganization.abi,
        functionName: method,
        args: args,
        enabled: isTxReady,
    })

    const { writeAsync } = useContractWrite(config);

    return { write: writeAsync, response, isSuccess };
}