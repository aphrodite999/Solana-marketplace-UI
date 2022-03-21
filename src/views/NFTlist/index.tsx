

import React, { useEffect, useState } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import './style.css';
import { RefreshIcon } from "@heroicons/react/outline";
import nftImg from "../../assets/lottie/1.jpg";

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



export const NFTList = () => {

    const [OfferState, SetOfferState] = useState(0);

    return (
        <div className="NFTList row mt-20">
            <div className="col-lg-2 col-md-1"></div>
            <div className="NFT-info col-lg-8 col-md-10 col-sm-12 row">
                <div className="NFT col-lg-4">
                    <img src={nftImg} alt="NFT" className="my-30" />
                    <div className="info" style = {{fontSize: '14'}}>
                        <div className="Brief d-flex justify-content-between my-3">
                            <p className="about">ABOUT THE COLLECTION</p>
                            <i className="fa fa-chevron-up "></i>
                        </div>
                    </div>
                    <p style={{ color: '#818181', fontSize: '14', margin: '20 0' }}>Pesky Penguin #4112 likes "Noot"</p>
                    <div className="divider"></div>
                    <div className="NFT-data" style = {{fontSize: '12'}}>
                        <div className="data-row">
                            <p>Details</p>
                            <i className="fa fa-chevron-up"></i>
                        </div>
                        <div className="data-row">
                            <p>Mint ID</p>
                            <div className = "d-flex">
                                <div className = "me-2">PEF4WMGOOKW5UVO... &nbsp</div>
                                <i className="fa fa-copy"></i>
                            </div>
                        </div>
                        <div className="data-row">
                            <p>TokenAddress</p>
                            <div className = "d-flex">
                                <div className = "me-2">PEF4WMGOOKW5UVO... &nbsp</div>
                                <i className="fa fa-copy"></i>
                            </div>
                            
                        </div>
                        <div className="data-row">
                            <p>Owner</p>
                            <div className = "d-flex">
                                <div className = "me-2">PEF4WMGOOKW5UVO... &nbsp</div>
                                <i className="fa fa-copy"></i>
                            </div>
                        </div>
                        <div className="data-row">
                            <p>Creator Royalties</p>
                            <p>5%</p>
                        </div>
                        <div className="data-row">
                            <p>Transaction Fee</p>
                            <p>0.99%</p>
                        </div>
                        <div className="data-row">
                            <p>Listing/Lower fee/Cancel</p>
                            <p>FREE</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8">
                    <h1 className="NFT-name">
                        Pesky Penguin #4112
                    </h1>
                    <h5 className="NFT-collection">
                        Pesky Penguins
                    </h5>
                    <button className="NFT-verify d-flex">
                        <i className="fa fa-check"></i>
                        <p className="ms-2">verified</p>
                    </button>
                    <div className="fab-status">
                        <div>
                            <p className="cur-price">CURRENT PRICE</p>
                            <div className = "d-flex price">
                                <i className="fa fa-circle-coin"></i> 
                                <p>10</p>
                            </div>
                        </div>
                        <div style = {{ opacity: OfferState === 0 ? 0 : 1 }}>
                            <p className="cur-price">YOUR OFFER</p>
                            <div className = "d-flex price">
                                <i className="fa fa-circle-coin"></i> 
                                <p>1</p>
                            </div>
                        </div>
                        <div className="fab-icons">
                            <div className="fab-icon ms-3 d-flex">
                                <i className="fa fa-heart me-2" />
                                <h6>Add to Favorite</h6>
                            </div>
                            <div className="fab-icon d-flex ms-3 d-flex align-items-center">
                                <i className="fa fa-share-alt ms-2"></i>
                                <h6 className="ms-2"> Share </h6>
                                <i className="fa fa-chevron-down ms-2" style={{ fontSize: '12px' }}></i>
                            </div>
                            <div className="fab-icon d-flex ms-3">
                                <RefreshIcon />
                                <h6 className="me-2">Refresh</h6>
                            </div>
                        </div>
                    </div>
                    <div className="btn-group">
                        <button className="btn-setting" style={{ backgroundColor: '#4FBBEA' }}> BUY FOR 10 SOL </button>
                        <button className="btn-setting" style={{ backgroundColor: OfferState === 0  ? '#86CDFB' : '#F14726' }} onClick = {() => {SetOfferState(1-OfferState)}}> {OfferState ===0 ? 'MAKE OFFER' : 'CANCEL OFFER'} </button>
                        <button className="btn-setting" style={{ backgroundColor: '#737371' }}> MESSAGE OWNER </button>
                    </div>
                    
                    <div className="attributes" style = {{borderTop: '2px solid #5FA78E', borderBottom: '1px solid #818181'}}>
                        <div className="attributes-title">
                            <p style={{ fontSize: '24px' }}> ATTRIBUTE </p>
                            <i className="fa fa-chevron-up" style={{ fontSize: '20px' }}></i>
                        </div>
                        <div className="attribute-group">
                            <div className="row">
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Background </h4>
                                    <h4 style={{ fontSize: '24px' }}> Greyteal </h4>
                                </div>
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Type </h4>
                                    <h4 style={{ fontSize: '24px' }}> Black </h4>
                                </div>
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Head </h4>
                                    <h4 style={{ fontSize: '24px' }}> Fouxhawk </h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Accessories </h4>
                                    <h4 style={{ fontSize: '24px' }}> None </h4>
                                </div>
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Eyes </h4>
                                    <h4 style={{ fontSize: '24px' }}> Wink </h4>
                                </div>
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Body </h4>
                                    <h4 style={{ fontSize: '24px' }}> Coller </h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="attr">
                                    <h4 style={{ fontSize: '20px' }}> Beak </h4>
                                    <h4 style={{ fontSize: '24px' }}> None </h4>
                                </div>
                            </div>
                        </div>
                        <button className="search-btn">
                            <i className="fa fa-search me-3"></i>
                            <p>SEARCH OTHER LISTINGS WITH THESE ATTRIBUTES</p>
                        </button>
                    </div>
                    <div className="offer-info">
                        <div className="offer-title">
                            <p>Offers</p>
                        </div>
                        <div className="offer-details">
                            <div className="offer-detail">
                                <p>Price</p>
                                <p>8 SOL</p>
                            </div>
                            <div className="offer-detail">
                                <p>Floor Difference</p>
                                <p>-20%</p>
                            </div>
                            <div className="offer-detail">
                                <p>Buyer</p>
                                <p>dasd....dasd</p>
                            </div>
                        </div>
                    </div>
                    <div className="sales-info">
                        <div className="sales-title">
                            <p>SALES HISTORY</p>
                            <i className="fa fa-chevron-up"></i>
                        </div>
                        <div className="sales-details">
                            <div className="sales-detail">
                                <p>Price</p>
                                <p>8 SOL</p>
                            </div>
                            <div className="sales-detail">
                                <p>Floor Difference</p>
                                <p>-20%</p>
                            </div>
                            <div className="sales-detail">
                                <p>Buyer</p>
                                <p>dasd....dasd</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-2 col-md-1"></div>
        </div>
    );
};

