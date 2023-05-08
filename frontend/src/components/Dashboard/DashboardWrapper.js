import {
    OrgContextProvider,
    UserContextProvider,
    WindowContextProvider
} from '@contexts';

import { Wallet, ActionBar } from '@components';

const DashboardWrapper = ({ children, paramAddress }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');

    const focusedAddress = paramAddress !== undefined ? paramAddress : address;

    return (
        <WindowContextProvider>
            <Wallet>
                <OrgContextProvider paramAddress={focusedAddress}>
                    <UserContextProvider>
                        <ActionBar />

                        {children}
                    </UserContextProvider>
                </OrgContextProvider >
            </Wallet>
        </WindowContextProvider >
    )
}

export { DashboardWrapper }