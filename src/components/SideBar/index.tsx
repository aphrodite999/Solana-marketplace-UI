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
import {
    FaTachometerAlt,
    FaGem,
    FaList,
    FaGithub,
    FaRegLaughWink,
    FaHeart
} from "react-icons/fa";


import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"
import * as ROUTES from "../../constants/routes"
import { Link } from "react-router-dom"
import { fetchMetadata } from "../../actions/metadata"
import { ConnectMessage } from "../../components/ConnectMessage"
import { LoadingWidget } from "../../components/loadingWidget"
import { NftCard } from "../../components/NftCard"
import { Page } from "../../components/Page"
import { RefreshIcon } from "@heroicons/react/outline"
import { kFormatter, shortenAddress } from "../../utils"

import {
    BASE_URL_COLLECTIONS_RETRIEVER,
    COLLECTIONS_RETRIEVER_QUERY_PARAM,
    BASE_URL_OFFERS_RETRIEVER,
} from "../../constants/urls"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { useWallet } from "../../contexts/wallet"
import { useUserAccounts } from "../../hooks"
import { ActiveOffer, EscrowInfo } from "../../types"
import { getEscrowFromCollectionName } from "../../utils"
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
import { forceCheck } from "react-lazyload"
import { StyledSelect } from "../../components/StyledSelect"
import { getDomainList } from "../../utils/getDomainList"
import {
    DomainNameAndAuction,
    useDomainListing,
} from "../../contexts/domainListings"
import { DomainName } from "../../utils/name-service"
import { DomainCard } from "../../components/DomainCard"
import "../../components/SideBar/style.css"
import 'font-awesome/css/font-awesome.min.css'
import useWindowDimensions from "../../utils/layout";


export const SideBar = ({ setOfferState }: any) => {



    const connection = useConnection()
    const { connected, wallet } = useWallet()
    const { getListedDomains, userHasBids, isUserWinner } = useDomainListing()
    const [listedBonfidaDomains, setListedBonfidaDomains] =
        useState<DomainNameAndAuction[]>()
    const { endpoint } = useConnectionConfig()
    const {
        listedMintsFromEscrow,
        mintsInWalletUnlisted,
        listedMintsFromDirectSell,
        listedMintsFromDutch,
    } = useUserAccounts()
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingUnlisted, setIsLoadingUnlisted] = useState(false)
    const [isLoadingListed, setIsLoadingListed] = useState(false)
    const [isLoadingEscrow, setIsLoadingEscrow] = useState(false)
    const [isLoadingDutch, setIsLoadingDutch] = useState(false)
    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [unlistedNfts, setUnlistedNfts] = useState<ActiveOffer[]>([])
    const [listedNftsEscrow, setListedNftsEscrow] = useState<ActiveOffer[]>([])
    const [listedNftsDutch, setListedNftsDutch] = useState<ActiveOffer[]>([])
    const [listedNfts, setListedNfts] = useState<ActiveOffer[]>([])
    const [unclaimedDomains, setUnclaimedDomains] =
        useState<(DomainNameAndAuction | undefined)[]>()
    const [activeDomainBids, setActiveDomainBids] =
        useState<(DomainNameAndAuction | undefined)[]>()
    const [collectionsInWallet, setCollectionsInWallet] = useState(
        () => new Set()
    )
    const [collectionFilter, setCollectionFilter] = useState("")
    const tab = useTabState()

    useEffect(() => {
        if (wallet?.publicKey && !listedBonfidaDomains) {
            ; (async () => {
                setIsLoadingDomains(true)
                const listedDomains = await getListedDomains(
                    connection,
                    wallet.publicKey as PublicKey
                )
                setListedBonfidaDomains(listedDomains as DomainName[])
                setIsLoadingDomains(false)
            })()
        }
    }, [wallet?.publicKey, listedBonfidaDomains])

    const getListedNftsEscrow = useCallback(async () => {
        setIsLoadingEscrow(true)
        const collectionsListedWallet: any = []
        const listedNftsFromWallet: (ActiveOffer | undefined)[] = await Promise.all(
            listedMintsFromEscrow.map(async (mint: string) => {
                let offerInfo
                try {
                    const offerPromise = await fetch(
                        `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    offerInfo = await offerPromise.json()
                } catch (error) {
                    console.log("darn")
                }

                let collection = null
                try {
                    const collectionPromise = await fetch(
                        `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    collection = JSON.parse(await collectionPromise.json())
                } catch (error) {
                    // TODO: treat this error; perhaps show a error toastr
                }

                let contract = undefined
                if (collection) {
                    contract = getEscrowFromCollectionName(endpoint, collection?.name)
                    if (!collectionsListedWallet.includes(collection?.name)) {
                        collectionsListedWallet.push(collection?.name)
                    }
                }

                if (Object.keys(offerInfo).length > 0) {
                    const activeOffer: ActiveOffer = {
                        metadata: offerInfo.metadata,
                        mint: mint,
                        price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
                        escrowPubkeyStr: offerInfo.pk,
                        contract: offerInfo.contract,
                        collectionName:
                            !!collection && collection !== [] ? collection?.name : "",
                        isListed: false,
                        isVerifeyed:
                            !!collection && collection !== [] ? collection?.name : "",
                    }
                    return activeOffer
                }
            })
        )
        // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
        const listedNftsFromWalletFiltered = listedNftsFromWallet.filter(
            Boolean
        ) as ActiveOffer[]
        // console.log( unlistedNftsFromWalletFiltered );
        setListedNftsEscrow(listedNftsFromWalletFiltered)
        setCollectionsInWallet(
            new Set([...collectionsInWallet, ...collectionsListedWallet])
        )
        setIsLoadingEscrow(false)
    }, [listedMintsFromEscrow])

    const getListedNfts = useCallback(async () => {
        setIsLoadingListed(true)
        const listedNftsFromDirect: (ActiveOffer | undefined)[] = await Promise.all(
            listedMintsFromDirectSell.map(async (mint: string) => {
                let offerInfo
                try {
                    const offerPromise = await fetch(
                        `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    offerInfo = await offerPromise.json()
                } catch (error) {
                    console.log("something went wrong with offerPromise")
                }

                let collection = null
                try {
                    const collectionPromise = await fetch(
                        `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    collection = JSON.parse(await collectionPromise.json())
                } catch (error) {
                    // TODO: treat this error; perhaps show a error toastr
                }

                let contract = undefined
                if (collection) {
                    contract = getEscrowFromCollectionName(endpoint, collection?.name)
                }

                if (Object.keys(offerInfo).length > 0) {
                    const activeOffer: ActiveOffer = {
                        metadata: offerInfo.metadata,
                        mint: mint,
                        price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
                        escrowPubkeyStr: offerInfo.pk,
                        contract: offerInfo.contract,
                        owner: offerInfo.owner,
                        collectionName: !!collection && collection !== [] ? collection?.name : "",
                        isListed: false,
                        isVerifeyed:
                            !!collection && collection !== [] ? collection?.name : "",
                    }
                    return activeOffer
                }
            })
        )
        // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
        const listedNftsFromDirectFiltered = listedNftsFromDirect.filter(
            Boolean
        ) as ActiveOffer[]
        // console.log( unlistedNftsFromWalletFiltered );
        setListedNfts(listedNftsFromDirectFiltered)
        setIsLoadingListed(false)
    }, [listedMintsFromDirectSell])

    const getListedNftsDutch = useCallback(async () => {
        setIsLoadingDutch(true)
        const listedNftsFromDutch: (ActiveOffer | undefined)[] = await Promise.all(
            listedMintsFromDutch.map(async (mint: string) => {
                let offerInfo
                try {
                    const offerPromise = await fetch(
                        `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    offerInfo = await offerPromise.json()
                } catch (error) {
                    console.log("something went wrong with offerPromise")
                }

                let collection = null
                try {
                    const collectionPromise = await fetch(
                        `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
                    )
                    collection = JSON.parse(await collectionPromise.json())
                } catch (error) {
                    // TODO: treat this error; perhaps show a error toastr
                }

                let contract = undefined
                if (collection) {
                    contract = getEscrowFromCollectionName(endpoint, collection?.name)
                }

                if (Object.keys(offerInfo).length > 0) {
                    const activeOffer: ActiveOffer = {
                        metadata: offerInfo.metadata,
                        mint: mint,
                        price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
                        escrowPubkeyStr: offerInfo.pk,
                        contract: offerInfo.contract,
                        owner: offerInfo.owner,
                        collectionName: !!collection && collection !== [] ? collection?.name : "",
                        isListed: false,
                        isVerifeyed:
                            !!collection && collection !== [] ? collection?.name : "",
                    }
                    return activeOffer
                }
            })
        )
        // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
        const listedNftsFromDutchFiltered = listedNftsFromDutch.filter(
            Boolean
        ) as ActiveOffer[]
        // console.log( unlistedNftsFromWalletFiltered );
        setListedNftsDutch(listedNftsFromDutchFiltered)
        setIsLoadingDutch(false)
    }, [listedMintsFromDutch])

    const getUnlistedNfts = useCallback(async () => {
        setIsLoadingUnlisted(true)
        const collectionsUnListedWallet: any = []
        const listedAccountsDecoded: (ActiveOffer | undefined)[] =
            await Promise.all(
                mintsInWalletUnlisted.map(async (mint: string) => {
                    const offer = {} as ActiveOffer

                    let collection = null
                    try {
                        const collectionPromise = await fetch(
                            `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
                        )
                        collection = JSON.parse(await collectionPromise.json())
                    } catch (error) {
                        // TODO: treat this error; perhaps show a error toastr
                    }

                    const contract = getEscrowFromCollectionName(endpoint, "")
                    let metadata = null
                    try {
                        metadata = await fetchMetadata(
                            connection,
                            new PublicKey(mint),
                            contract as EscrowInfo
                        )
                    } catch (error) {
                        // TODO: treat this error; perhaps show a error toastr
                    }

                    if (!metadata) return

                    offer.mint = mint.toString()
                    offer.price = 0
                    // offer.escrowPubkeyStr = account.pubkey.toString();
                    offer.metadata = metadata
                    offer.isListed = true
                    offer.collectionName =
                        !!collection && collection !== [] ? collection?.name : ""
                    offer.isVerifeyed = !!collection && collection !== []
                    if (offer.collectionName) {
                        collectionsUnListedWallet.push(offer.collectionName)
                    }
                    return offer
                })
            )

        const listedAccountsDecodedFiltered = listedAccountsDecoded.filter(
            Boolean
        ) as ActiveOffer[]
        setUnlistedNfts(listedAccountsDecodedFiltered)
        setCollectionsInWallet(
            new Set([...collectionsInWallet, ...collectionsUnListedWallet])
        )
        setIsLoadingUnlisted(false)
    }, [mintsInWalletUnlisted])

    const refreshWalletItems = async () => {
        setIsLoading(true)
        await getListedNfts()
        await getListedNftsEscrow()
        await getUnlistedNfts()
        setIsLoading(false)
    }

    useEffect(() => {
        getUnlistedNfts()
    }, [mintsInWalletUnlisted])

    useEffect(() => {
        getListedNfts()
    }, [listedMintsFromDirectSell])

    useEffect(() => {
        getListedNftsEscrow()
    }, [listedMintsFromEscrow])

    useEffect(() => {
        getListedNftsDutch()
    }, [listedMintsFromDutch])

    useEffect(() => {
        forceCheck()
    }, [tab])

    const getUnclaimedDomains = async () => {
        if (!wallet || !listedBonfidaDomains) return
        const winningDomains = listedBonfidaDomains?.map(async (domain) => {
            if (domain?.domainOwner?.toString() !== wallet?.publicKey?.toString()) {
                const hasBid = await userHasBids(connection, wallet, domain)
                const isWinning = await isUserWinner(
                    connection,
                    wallet,
                    domain
                )
                return hasBid && isWinning
            }
        })

        const hasWonDomainsList = await Promise.all(winningDomains)

        return listedBonfidaDomains?.map(async (domain, idx) => {
            const inUsersWallet = wallet?.domainNames?.find(
                (localDomain) => localDomain?.name === domain.name
            )

            const userIsWinner = hasWonDomainsList[idx]

            const time =
                parseInt(domain?.auctionData?.endedAt?.toString() as string) -
                new Date().getTime() / 1000

            if (!inUsersWallet && time < 0) {
                if (userIsWinner) {
                    return domain
                } else if (
                    domain.domainOwner?.toString() === wallet?.publicKey?.toString()
                ) {
                    return domain
                } else {
                    return undefined
                }
            }
        })
    }

    const userListedDomains = listedBonfidaDomains?.filter((domain) => {
        const time =
            parseInt(domain?.auctionData?.endedAt?.toString() as string) -
            new Date().getTime() / 1000

        if (
            domain?.domainOwner?.toString() === wallet?.publicKey?.toString() &&
            time > 0
        ) {
            return domain
        }
    })

    const userDomainBids = async () => {
        if (!wallet) return
        return listedBonfidaDomains?.map(async (domain) =>
            domain
                ? (await userHasBids(connection, wallet, domain))
                    ? domain
                    : undefined
                : undefined
        )
    }

    useEffect(() => {
        if (wallet?.publicKey && connection && listedBonfidaDomains) {
            ; (async () => {
                const domainsWithBids = await userDomainBids()

                if (domainsWithBids) {
                    const domians = await Promise.all(domainsWithBids)
                    setActiveDomainBids(domians.filter((domain) => domain))
                }
            })()
        }
    }, [listedBonfidaDomains, wallet?.publicKey, connection])

    useEffect(() => {
        if (wallet?.publicKey && connection && listedBonfidaDomains) {
            ; (async () => {
                const userUnclaimedDomains = await getUnclaimedDomains()

                if (userUnclaimedDomains) {
                    const domains = await Promise.all(userUnclaimedDomains)
                    setUnclaimedDomains(domains.filter((domain) => domain))
                }
            })()
        }
    }, [listedBonfidaDomains, wallet?.publicKey, connection])

    console.log(listedNftsDutch);

    const [menuCollapse, setMenuCollapse] = useState(true)

    //create a custom function that will change menucollapse state from false to true and true to false
    const menuIconClick = () => {
        //condition checking to change state from true to false and vice versa
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

    const { width } = useWindowDimensions();

    const check_width = (e:any) => {
        const width = window.innerWidth;
        console.log(menuCollapse);
        if(width>768&&!menuCollapse){
            console.log('>');
            setMenuCollapse(true);
        }
        if(width<=768&&menuCollapse){
            setMenuCollapse(false);
        }
        
    }

    useEffect (() => {
       window.addEventListener('resize', (e)=>{
        check_width(e);
       })
    },[])



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
                            <Link to={ROUTES.WALLET}>
                                <MenuItem> <a href="/wallet" id="wallet"> Owned NFTs </a> </MenuItem>
                            </Link>

                            <MenuItem> <a href="/list" id="listed"> Listed NFTs </a> </MenuItem>
                            {/* <MenuItem><a onClick={()=>{setOfferState('Offer Received')}}> Offers Received </a> </MenuItem>
                    <MenuItem ><a onClick={()=>{setOfferState('Offer Made')}}> Offers Made </a></MenuItem> */}
                            <MenuItem> <a href="" id="bids"> Live Domain Bids </a> </MenuItem>
                            {/* <MenuItem> Creations </MenuItem> */}
                            <MenuItem> <a href="" id="auction"> Activities </a> </MenuItem>
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
