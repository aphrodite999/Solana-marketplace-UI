import React from "react";
import { Button } from "@material-ui/core";
import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent
} from "react-pro-sidebar";
import {
    FaTachometerAlt,
    FaGem,
    FaList,
    FaGithub,
    FaRegLaughWink,
    FaHeart
} from "react-icons/fa";

export const SideBar = ({setOfferState}:any) => {


    return (
        <ProSidebar
        >
            <SidebarHeader
                style={{
                    padding: 40,
                }}>
                <div className="sidebar-header1">
                    <div>
                        Your Wallet
                    </div>
                    <div className="sidebar-header2 mt-2">
                        Call Dai
                    </div>
                    <div className="sidebar-header3 mt-2">
                        Total Floor Value
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent
                style={{
                    padding: 20,
                    color: "white"
                }}
            >
                <Menu>
                    <MenuItem> Dashboard </MenuItem>
                    <MenuItem> Owned NFTs </MenuItem>
                    <MenuItem> <a href = "/list"> Listed NFTs </a> </MenuItem>
                    <MenuItem><a onClick={()=>{setOfferState('Offer Received')}}> Offers Received </a> </MenuItem>
                    <MenuItem ><a onClick={()=>{setOfferState('Offer Made')}}> Offers Made </a></MenuItem>
                    <MenuItem> Live Domain Bids </MenuItem>
                    <MenuItem> Creations </MenuItem>
                    <MenuItem> Activities </MenuItem>
                </Menu>
            </SidebarContent>

            <SidebarFooter
                style={{
                    textAlign: "center",
                    padding: 20,
                    color: "white"
                }}>
                <div>
                    <p
                        style={{
                            textTransform: "uppercase",
                            marginBottom: "20px"
                        }}>
                        Bidding Account
                    </p>
                    <p> Balance &nbsp; &nbsp; 20 SOL</p>
                    <button className = "sidebar-btn">Deposit</button>
                    <button className = "sidebar-btn">Withdraw</button>
                </div>
            </SidebarFooter>
        </ProSidebar >
    );
};

