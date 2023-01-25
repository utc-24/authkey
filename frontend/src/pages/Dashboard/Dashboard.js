import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";

import { ErrorContextProvider, OrgContextProvider, UserContextProvider } from "@contexts"

import { ActionBar, Dashboard as DashboardContent, HelpSidebar, MobilePreventor } from "@components";

import { Badge, BadgeForm, Home, Org, OrgForm } from "@pages";

import "@style/Dashboard/Dashboard.css";

const Dashboard = () => {
    const { data: signer } = useSigner();
    const { address } = useAccount();
    const [isMobile, setIsMobile] = useState(false);

    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <MobilePreventor isMobile={isMobile} setIsMobile={setIsMobile} />

            {!isMobile &&
                <div className={collapsed ? "dashboard collapsed" : "dashboard"}>
                    <ErrorContextProvider>
                        <UserContextProvider signer={signer} address={address}>
                            <OrgContextProvider>
                                <div className="dashboard__contents">
                                    <ActionBar
                                        address={address}
                                        collapsed={collapsed}
                                        setCollapsed={setCollapsed}
                                    />

                                    <DashboardContent>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/organization/new" element={<OrgForm />} />
                                            <Route path="/organization/:orgId" element={<Org />} />
                                            <Route path="/organization/:orgId/edit" element={<OrgForm isEdit={true} />} />
                                            <Route path="/organization/:orgId/badge/new" element={<BadgeForm />} />
                                            <Route path="/organization/:orgId/badge/:badgeId" element={<Badge />} />
                                            <Route path="/organization/:orgId/badge/:badgeId/edit" element={<BadgeForm isEdit={true} />} />
                                        </Routes>
                                    </DashboardContent>
                                </div>

                                <HelpSidebar
                                    collapsed={collapsed}
                                />
                            </OrgContextProvider>
                        </UserContextProvider>
                    </ErrorContextProvider>
                </div>
            }
        </>
    )
}

export { Dashboard };