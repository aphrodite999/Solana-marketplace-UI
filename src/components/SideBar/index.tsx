import React from "react";
import {
    ProSidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    SidebarFooter,
    SidebarContent
} from "react-pro-sidebar";

import { useCallback, useEffect, useState } from "react"

import "../../components/SideBar/style.css"
import 'font-awesome/css/font-awesome.min.css'
import useWindowDimensions from "../../utils/layout";


export const SideBar = ({ setOfferState }: any, props: any) => {


    const [menuCollapse, setMenuCollapse] = useState(true)

    //create a custom function that will change menucollapse state from false to true and true to false
    const menuIconClick = () => {
        //condition checking to change state from true to false and vice versa
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

    const { width } = useWindowDimensions();

    const check_width = (e: any) => {
        const width = window.innerWidth;
        console.log(menuCollapse);
        if (width > 768 && !menuCollapse) {
            console.log('>');
            setMenuCollapse(true);
        }
        if (width <= 768 && menuCollapse) {
            setMenuCollapse(false);
        }

    }

    useEffect(() => {
        window.addEventListener('resize', (e) => {
            check_width(e);
        })
    }, [])


    return (
        <>
            {menuCollapse ?
                <ProSidebar
                    className="col-2 col-md-3 col-sm-12">

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
                        <div className="closemenu" onClick={menuIconClick}>
                            {/* changing menu collapse icon on click */}
                            {menuCollapse ? (
                                <i className="fa fa-arrow-circle-left"></i>
                            ) : (
                                <i className="fa fa-arrow-circle-right"></i>
                            )}
                        </div>
                    </SidebarHeader>

                    <SidebarContent
                        style={{
                            padding: 20,
                            color: "white"
                        }}
                    >
                        <Menu>
                            <MenuItem onClick={() => { props.getStatus(0) }}> Owned NFTs </MenuItem>
                            <MenuItem onClick={() => { props.getStatus(1) }}> Listed NFTs </MenuItem>
                            {/* <MenuItem><a onClick={()=>{setOfferState('Offer Received')}}> Offers Received </a> </MenuItem>
                            <MenuItem ><a onClick={()=>{setOfferState('Offer Made')}}> Offers Made </a></MenuItem> */}
                            <MenuItem onClick={() => { props.getStatus(2) }}> Live Domain Bids </MenuItem>
                            {/* <MenuItem> Creations </MenuItem> */}
                            <MenuItem onClick={() => { props.getStatus(3) }}> <a href="" id="auction"> Activities </a> </MenuItem>
                        </Menu>
                    </SidebarContent>


                    {/* <SidebarFooter
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
            </SidebarFooter> */}
                </ProSidebar >
                :
                <div className="small-sidebar">
                    <div className="closemenu" onClick={menuIconClick}>
                        {/* changing menu collapse icon on click */}
                        {menuCollapse ? (
                            <i className="fa fa-arrow-circle-left"></i>
                        ) : (
                            <i className="fa fa-arrow-circle-right"></i>
                        )}
                    </div>
                </div>
            }
        </>

    );
};
