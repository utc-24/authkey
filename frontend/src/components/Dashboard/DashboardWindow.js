import { useAuthentication, useUser, useMouse } from "@hooks";

import { ConnectButton, Empty, LoadingTransaction } from "@components";

import { useWindowMessage } from "@hooks";

const connectButton = <ConnectButton className="primary" />;

const ConnectWalletEmpty = () => <Empty
    title="Connect your wallet to view your Organizations!"
    body="Connecting your wallet is simple and secure. Using Sign in with Ethereum, you can sign and create, manage, and share your Organizations and Badges in seconds just by signing a message."
    button={connectButton}
/>

const WrongNetworkEmpty = ({ primaryChain }) => <Empty
    title="Wrong Network!"
    body={`Please connect to ${primaryChain.name} network.`}
    button={connectButton}
/>

const LoadingEmpty = () => <Empty
    title="Loading Organizations and Badges..."
    body="This may take a few seconds. If this takes longer than 10 seconds, please refresh the page."
/>

const DashboardWindow = ({ children }) => {
    const {
        primaryChain,
        isConnected,
        isWrongNetwork
    } = useAuthentication();

    const { isLoaded } = useUser();
    
    const { windowState: window, isMessage } = useWindowMessage();

    const { lastClick } = useMouse();
    
    if (!isConnected)
        return <ConnectWalletEmpty />
    
    if (isMessage)
        return <LoadingTransaction 
            title={window.message.title}
            body={window.message.body}
            txHash={window.message.details}
            lastClick={lastClick}
        />;

    if (isConnected && isWrongNetwork)
        return <WrongNetworkEmpty primaryChain={primaryChain} />

    if (isConnected && !isWrongNetwork && !isLoaded)
        return <LoadingEmpty />

    return <>{ children }</>
}

export { DashboardWindow }