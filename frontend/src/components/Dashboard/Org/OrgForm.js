import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "wagmi";

import { UserContext } from "@components/Dashboard/Provider/UserContextProvider";
import Header from "@components/Dashboard/Header/Header";
import ActionBar from "@components/Dashboard/Form/ActionBar";
import Input from "@components/Dashboard/Form/Input";

import { useBadgerPress } from "@hooks/useContracts";
import { postOrgRequest } from "@utils/api_requests";

const OrgForm = () => {
    const [orgName, setOrgName] = useState("");
    const [orgSymbol, setOrgSymbol] = useState("");
    const { userData, setUserData } = useContext(UserContext);

    const { chain } = useNetwork();
    const navigate = useNavigate();
    const createContract = useBadgerPress(chain.name);

    const actions = [
        {
            text: "CREATE",
            icon: ["fal", "arrow-right"],
            event: () => onOrgFormSubmission()
        }
    ]

    const nameToSymbol = (name) => {
        return name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 5);
    }

    const onOrgNameChange = (e) => {
        setOrgName(e.target.value)

        if (orgSymbol === nameToSymbol(orgName)) {
            setOrgSymbol(nameToSymbol(e.target.value));
        }
    }

    // Create the Org object, deploy the contract clone, and post the Org to the API.
    const onOrgFormSubmission = async () => {
        const orgObj = {
            is_active: false,
            chain: chain.name,
            ethereum_address: '',
            name: orgName,
            symbol: orgSymbol,
            description: 'This is a super cool description.',
            image_hash: '0x',
            contract_uri_hash: '0x',
        }

        // Deploy and initialize org contract
        let cloneTx = await createContract.write?.();
        cloneTx = await cloneTx.wait();
        const contractAddress = cloneTx.logs[0].address;
        orgObj.ethereum_address = contractAddress;
        if (contractAddress) orgObj.is_active = true;

        const response = await postOrgRequest(orgObj);

        if (!response?.error && response?.id) {
            addOrgToState(response);
            navigate(`/dashboard/organization?orgId=${response.id}`);
        }
    }

    // Determines if organizations is already in userData, before pushing or settings
    // the new organization to userData.
    const addOrgToState = (org) => {
        let newUserData = {...userData};

        if (newUserData.organizations)
            newUserData.organizations.push(org);
        else
            newUserData.organizations = [org];

        setUserData(newUserData);
    }

    return (
        <div id="new-org">
            <Header back={() => navigate("/dashboard")} />

            <h2>Create Organization</h2>

            <Input 
                name="orgName"
                label="Organization Name" 
                required={true}
                value={orgName} 
                onChange={onOrgNameChange} 
            />

            <Input
                name="orgSymbol"
                label="Organization Symbol"
                required={true}
                value={orgSymbol}
                onChange={(e) => setOrgSymbol(e.target.value)}
            />

            <ActionBar 
                help={"Badge creation occurs after your organization has been established."} 
                actions={actions} 
            />
        </div>
    )
}

export default OrgForm;