// @ts-ignore
import { IKImage } from "imagekitio-react"
import {
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
} from "reakit/Tooltip"
import { Menu, Popover, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/outline"
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { ReactComponent as VerifiedCircle } from "../../assets/icons/user-verified.svg"
import { Link, useHistory, useLocation, useParams } from "react-router-dom"
import { LoadingWidget } from "../../components/loadingWidget"
import { CreationsMasonry } from "../../components/CreationsMasonry"
import { Page } from "../../components/Page"
import { VerifeyedBadge } from "../../components/VerifeyedBadge"
import {
  getImagePath,
  IMAGE_KIT_ENDPOINT_URL,
  isImageInCache,
} from "../../constants/images"
import Masonry from "react-masonry-css"
import * as ROUTES from "../../constants/routes"
import {
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
  FOLLOW_TOGGLE_URL,
  CHECK_IS_FOLLOWING,
  BASE_URL_COLLECTIONS_RETRIEVER,
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  BASE_URL_OFFERS_RETRIEVER,
  SOLO_PROF_GALLERY,
  SOLO_PROF_CREATIONS_TOGGLE_HIDE,
} from "../../constants/urls"
import { useWallet as useWallet0 } from "../../contexts/wallet"
import {
  classNames,
  encodeFiltersToUrl,
  findCollection,
  getFiltersFromUrl,
  kFormatter,
  mapObjectQueryParams,
  removeNullValuesFromObject,
  useLocalStorageState,
  authApiRequest,
} from "../../utils"
import useDidMountEffect from "../../utils/use-did-mount-effect"
import { NotFoundView } from "../404"
import { ErrorView } from "../error"
import { FavouriteButton } from "../../components/FavouriteButton"
import { ThumbnailImage } from "../../components/ThumbnailImage"
import { ReactComponent as DiscordLogo } from "../../assets/logo/discord.svg"
import { ReactComponent as TwitterLogo } from "../../assets/logo/twitter.svg"
import { Divider } from "../../components/Divider"
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
import { ActiveArtist, Metadata } from "../../types"
import { useConnection,useConnectionConfig } from "../../contexts/connection"
import { fetchMetadataSolo } from "../../actions/metadata"
import { PublicKey } from "@solana/web3.js"
import { ProfileLink } from "../../components/SoloCreateStepper/ProfileImagesUploader/ProfileLink"
import { UserListModal } from "../../components/UserListModal"
import "./styles.css"
import { PencilAltIcon } from "@heroicons/react/outline"
import { signAndSendTransactionInstructions } from "@bonfida/spl-name-service"
import SOLO_THEMES, { Theme } from "../../constants/solo-themes"
import SoloProfileContext from "../../contexts/solo-profile"
import { ActiveOffer, EscrowInfo } from "../../types"
import { useUserAccounts } from "../../hooks"
import { getEscrowFromCollectionName } from "../../utils"
import { fetchMetadata } from "../../actions/metadata"


export const SoloProfileView = () => {
  const tab =  useTabState({ selectedId: "tab1" })
  const history = useHistory()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMasonry, setIsLoadingMasonry] = useState(false)
  const [imageCacheFailed, setImageCacheFailed] = useState<boolean>(false)
  const [bannerCacheFailed, setBannerCacheFailed] = useState<boolean>(false)
  const [artist, setArtist] = useState<ActiveArtist | undefined>(undefined)
  const [creations, setCreations] = useState<any[]>([])
  const [creationsDisplay, setCreationsDisplay] = useState<any[]>([])
  const [collection, setCollection] = useState<any[]>([])
  const [editCreations,setEditCreations] = useState<boolean>(false)
  const [editCollection,setEditCollection] = useState<boolean>(false)
  const [isLoadingUnlisted,setIsLoadingUnlisted] = useState<boolean>(false)
  const [unlistedNfts, setUnlistedNfts] = useState<ActiveOffer[]>([])
  const { endpoint } = useConnectionConfig()

  const {
    mintsInWalletUnlisted,
    listedMintsFromDirectSell,
  } = useUserAccounts()
  const [rerender, setRerender] = useState(false)
  const connection = useConnection()
  const wallet = useWallet0()
  const { setIsProfilePage, profileTheme, setProfileTheme } =
    useContext(SoloProfileContext)
  const [followed, setFollowed] = useState<boolean>(false)
  const publicKey = wallet.publicKey
  const [followersCount, setFollowersCount] = useState<number>()
  const [followingCount, setFollowingCount] = useState<number>()
  const [userListDrawer, setUserListDrawer] = useState<boolean>()
  const [modalType, setModalType] = useState<string>("")
  const { artist: artistName } = useParams<{ artist: string }>()
  const [collectionsInWallet, setCollectionsInWallet] = useState(
    () => new Set()
  )

  async function getUserInfo() {
    const retrievedUser = await fetch(
      `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${artistName}`
    ).then((res) => {
      if (res.ok) {
        return res.json()
      } else {
        history.push("/404")
        setArtist(undefined)
        return false
      }
    })

      Promise.all(
        retrievedUser.mints_list.map(async (mint: any) => {
          try {
            const mintMetadata = await fetchMetadataSolo(
              connection,
              new PublicKey(mint?.mint_address)
            )
            return {
              image: mintMetadata?.image,
              mint: mint?.mint_address,
              escrowPubkeyStr: "",
              isHidden: mint?.is_hidden
            }
          } catch (e) {
            console.log("Getting Metadata failed", e)
          }
        })
      )
        .then((artistCreations) => {
          setCreations(artistCreations);
          setCreationsDisplay(artistCreations.filter((creation:any)=> creation.isHidden!=1 ))
        })
        .catch((err) => console.log(err))

      setArtist(retrievedUser)
      setFollowersCount(retrievedUser?.follower_count)
      setFollowingCount(retrievedUser?.following_count)
      console.log("hello");

      if (wallet?.publicKey) {
        const followedStatus = await fetch(
          `${CHECK_IS_FOLLOWING}?follower=${wallet?.publicKey}&user=${retrievedUser?.wallet_key}`
        ).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            setFollowed(false)
            return false
          }
        })
        setFollowed(followedStatus.message)
      }

      if (retrievedUser.theme.length < 15) {
        setProfileTheme(SOLO_THEMES["default"])
        console.log("Default theme");
      } else{
      const userTheme = JSON.parse(retrievedUser?.theme)

      if (userTheme.key === "custom") {
        console.log("custom theme");
        setProfileTheme(userTheme)
      }else{
      setProfileTheme(SOLO_THEMES[userTheme.key])
      console.log("set theme");}}

      if (retrievedUser.gallery.length>0) {

        Promise.all(
          retrievedUser.gallery.map(async (nft: any) => {
            try {
              const mintMetadata = await fetchMetadataSolo(
                connection,
                new PublicKey(nft?.mint)
              )
              return {
                image: mintMetadata?.image,
                name: mintMetadata?.name,
                mint: nft?.mint,
                escrowPubkeyStr: "",
              }
            } catch (e) {
              console.log("Getting Metadata failed", e)
            }
          })
        ).then((artistCollection) => {
          setCollection(artistCollection)
        })
        .catch((err) => console.log(err))}
        setIsLoadingMasonry(false);
        console.log("hello2");

  }


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
    setIsLoadingMasonry(false)
  },[])



  const imageCacheFallback = (parentNode: any) => {
    setImageCacheFailed(true)
  }

  const bannerCacheFallback = (parentNode: any) => {
    setBannerCacheFailed(true)
  }

  const followToggle = async (targetUserAddress: string) => {
    if (wallet?.publicKey) {
      await authApiRequest(
        FOLLOW_TOGGLE_URL,
        { user: targetUserAddress },
        "POST",
        "application/json",
        wallet
      )
      setTimeout(() => {
        getUserInfo()
      }, 400)
    }
  }

  function goToEditProfile() {
    history.push(`${ROUTES.SOLO_SETTINGS}`)
  }
  function goToEditCreations() {
    setEditCreations(true);
    //@ts-ignore
    document.getElementById("tab2").click();
  }
  function goToEditCollection() {
    setEditCollection(true);
    setIsLoadingMasonry(true)
    getUnlistedNfts();
    //@ts-ignore
    document.getElementById("tab1").click();

  }

  const showUserList = (type: string) => {
    if (wallet?.publicKey) {
      setModalType(type)
      setUserListDrawer(true)
    }
  }

  const hideUserList = () => {
    setModalType("")
    setUserListDrawer(false)
  }

  const pageTitle = `DigitalEyes Market | ${
    artist?.username ? artist?.username : ""
  }`

  useEffect(() => {
    return () => setProfileTheme(SOLO_THEMES["default"])
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        setIsLoadingMasonry(true)
        await getUserInfo()
        setRerender(!rerender)
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        setIsLoadingMasonry(true)

      }
    })()
  }, [connection, artistName])

  useEffect(() => {
    setIsProfilePage(true)

    return () => {
      setIsProfilePage(false)
    }
  }, [])


const cancelEditCollection = () => {
  setEditCollection(false);
}
const cancelEditCreations = () => {
  setEditCreations(false);
}
const saveChangesCollection = async (items:any) => {
  setIsLoadingMasonry(true);
  setEditCollection(false);
  try{
     await authApiRequest(SOLO_PROF_GALLERY, { mints:items.toString() }, "POST", "application/json", wallet)
  }catch (err){
    console.log(err);
  }
  setTimeout( () => {
   getUserInfo()
 }, 2000);
}

const saveChangesCreations = async (items:any) => {
  setIsLoadingMasonry(true);
  setEditCreations(false);
  await creations.map((creation:any)=>{
    //add items that is not displayed but chosen
    if(items.includes(creation.mint) && creation.isHidden == 1){
      try{
         authApiRequest(`${SOLO_PROF_CREATIONS_TOGGLE_HIDE}?mint=${creation.mint}`, { }, "PUT", "application/json", wallet)
      }catch (err){
        console.log(err);
      }
    }
    //hide currently shown items that weren't chosen
    else if(!items.includes(creation.mint) && creation.isHidden != 1 ){
      try{
         authApiRequest(`${SOLO_PROF_CREATIONS_TOGGLE_HIDE}?mint=${creation.mint}`, { }, "PUT", "application/json", wallet)
      }catch (err){
        console.log(err);
      }
    }
  })
  setTimeout(async () => {
    await getUserInfo()
  }, 700);
}

  return (
    <Page title={pageTitle} className="flex flex-col">
      <>
        {isLoading && (
          <div className="flex justify-center my-96">
            <div className="w-48 text-center">
              <LoadingWidget />
              Loading User Profile...
            </div>
          </div>
        )}
        {!isLoading && artist && (
          <div
            className="w-full h-full flex"
            style={{ background: profileTheme.backgroundPrimary }}
          >
            <div
              className="mx-auto"
              style={{
                width: "64rem",
                maxWidth: "64rem",
              }}
            >
              <div className="overflow-hidden h-72 w-full object-cover mb-20 solo-profile-banner">
                {artist?.banner &&
                isImageInCache(artist?.banner) &&
                !bannerCacheFailed ? (
                  <IKImage
                    urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                    path={artist?.banner}
                    alt={artist?.username + "banner"}
                    className="w-full object-cover h-full"
                    width="1000"
                    onError={bannerCacheFallback}
                  />
                ) : (
                  <img
                    src={
                      artist?.banner.length === 0
                        ? "https://via.placeholder.com/300/000000/000000/?text=solo"
                        : artist?.banner
                    }
                    alt={artist?.username + "banner"}
                    className="w-full object-cover h-full"
                    width="1000"
                  />
                )}
              </div>

              <div className="max-w-5xl mx-4 sm:mx-6 lg:mx-auto relative flex justify-center px-7 z-10 ">
                {artist?.image &&
                isImageInCache(artist?.image) &&
                !imageCacheFailed ? (
                  <IKImage
                    urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                    path={artist?.image}
                    alt={artist?.username + "banner"}
                    className="w-36 h-36 md:w-48 md:h-48 absolute mx-auto my-0 bottom-0 rounded-full object-cover"
                    style={{
                      border: `5px solid ${profileTheme.profileBorder}`,
                    }}
                    onError={imageCacheFallback}
                  />
                ) : (
                  <img
                    src={
                      artist?.image.length === 0
                        ? "https://storage.googleapis.com/solo-creator-images-prod/defaultProfilePicture.jpeg"
                        : artist?.image
                    }
                    alt={artist?.username + "image"}
                    className="w-36 h-36 md:w-48 md:h-48 absolute mx-auto my-0 bottom-0 rounded-full object-cover"
                    style={{
                      border: `5px solid ${profileTheme.profileBorder}`,
                    }}
                  />
                )}
                {!!publicKey &&
                  publicKey?.toString() != artist?.wallet_key.toString() && (
                    <>
                      <div className="absolute -bottom-12  md:right-0 md:bottom-7 flex justify-center">
                        {!followed && (
                          <button
                            onClick={(e: any) => {
                              e.preventDefault()
                              followToggle(artist?.wallet_key)
                            }}
                            className="btn-prof px-4 md:px-7"
                          >
                            <span className="text-sm md:text-md"> Follow </span>
                          </button>
                        )}
                        {followed && (
                          <Menu
                            as="div"
                            className="z-40 mr-3 relative inline-block text-left opacity-90"
                          >
                            <Menu.Button className="text-white hover:text-gray-700 uppercase flex items-stretch">
                              <button className="btn-prof px-4 md:px-7">
                                <span className="text-sm md:text-md">
                                  {" "}
                                  Following{" "}
                                </span>{" "}
                                <ChevronDownIcon className="w-4 h-4 inline self-center ml-2 opacity-70" />
                              </button>
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="z-40 flex flex-col origin-top-right absolute right-0 p-2 bg-gray-900 rounded-lg w-auto  overflow-y-auto">
                                <Menu.Item>
                                  <button
                                    onClick={(e: any) => {
                                      e.preventDefault()
                                      followToggle(artist?.wallet_key)
                                    }}
                                    className="z-40 px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 cursor:pointer text-xs md:text-sm"
                                  >
                                    Unfollow User
                                  </button>
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        )}
                        {followed && (
                          <button
                            className="btn-prof btn-gray px-7"
                            onClick={(e: any) => {
                              history.push(
                                `${ROUTES.INBOX}/${artist?.wallet_key}`
                              )
                            }}
                          >
                            <span className="text-sm md:text-md">
                              {" "}
                              Message{" "}
                            </span>
                          </button>
                        )}
                      </div>
                    </>
                  )}

              </div>


              <div className="max-w-5xl mx-4 sm:mx-6 lg:mx-auto relative  px-7 my-4">
              {!!publicKey &&
                publicKey?.toString() == artist?.wallet_key.toString() && (
                  <>
                    <div className="absolute right-0 -top-20 flex justify-end">
                      {!followed && (
                        <Menu
                          as="div"
                          className="z-40 mr-3 relative inline-block text-left opacity-90"
                        >
                          <Menu.Button className="text-white hover:bg-gray-600 uppercase flex items-stretch rounded-md">
                            <button className="flex gap-2 items-center border border-gray-600 py-2 px-4 rounded-md transition">
                            <PencilAltIcon
                            style={{ color: profileTheme.textSecondary }}
                            className="w-4 md:w-6 h-auto inline" />

                              <span
                              className="text-xs md:text-md inline"
                              style={{ color: profileTheme.textSecondary }}>
                                Edit
                              </span>
                              <ChevronDownIcon
                              style={{ color: profileTheme.textSecondary }}
                              className="w-3 h-3 inline self-center ml-1 opacity-70" />
                            </button>
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                          <Menu.Items className="z-40 flex flex-col origin-top-right absolute right-0 p-2 bg-gray-900 rounded-lg w-auto  overflow-y-auto">

                            <Menu.Item>
                            <button
                              onClick={goToEditProfile}
                              className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                            >
                            <p
                            className="text-xs md:text-sm"> My Info</p>
                            </button>
                            </Menu.Item>
                            <Menu.Item>
                            <button
                            onClick={goToEditCollection}
                              className="z-90 px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                            >
                            <p
                            className="text-xs md:text-sm"> Collection </p>
                            </button>
                            </Menu.Item>
                            <Menu.Item>
                            <button
                            onClick={goToEditCreations}
                              className="z-90 px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                            >
                            <p
                            className="text-xs md:text-sm"> Creations </p>
                            </button>
                            </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      )}
                      {followed && (
                        <button
                          className="btn-prof btn-gray px-7"
                          onClick={(e: any) => {
                            history.push(
                              `${ROUTES.INBOX}/${artist?.wallet_key}`
                            )
                          }}
                        >
                          <span className="text-sm md:text-md">
                            {" "}
                            Message{" "}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
                <div className="text-center">
                  <div className="flex justify-center mt-4 mb-6">
                    <div className="grid grid-cols-2 w-56">
                      <div
                        onClick={(e: any) => {
                          showUserList("followers")
                        }}
                        className={
                          wallet?.publicKey
                            ? "border border-gray-800 rounded-l-lg flex-col py-1 hover:bg-gray-600 cursor-pointer z-10"
                            : "border border-gray-800 rounded-l-lg flex-col py-1 z-10"
                        }
                      >
                        <p
                        className="text-lg"
                        style={{ color: profileTheme.textSecondary }}>
                        {followersCount}
                        </p>
                        <p
                          className="text-xxs"
                          style={{ color: profileTheme.textSecondary }}
                        >
                          {followersCount === 1 ? "Follower" : "Followers"}
                        </p>
                      </div>
                      <div
                        onClick={(e: any) => {
                          showUserList("following")
                        }}
                        className={
                          wallet?.publicKey
                            ? "border-t border-r border-b border-gray-800 rounded-r-lg flex-col py-1 hover:bg-gray-600 cursor-pointer z-10"
                            : "border-t border-r border-b border-gray-800 rounded-r-lg flex-col py-1 z-10"
                        }
                      >
                        <p
                          className="text-lg"
                          style={{ color: profileTheme.textSecondary }}
                          >
                          {followingCount}
                          </p>
                        <p
                          className="text-xxs"
                          style={{ color: profileTheme.textSecondary }}
                        >
                          Following
                        </p>
                      </div>
                    </div>
                  </div>
                  <h2
                    className="text-3xl font-extrabold inline"
                    style={{ color: profileTheme.textPrimary }}
                  >
                    {artist?.username}
                  </h2>
                  {artist?.verified && (
                    <VerifiedCircle className="inline mx-3 mb-2 w-7 h-7" />
                  )}

                  <div className="my-2 text-gray-500">
                    <p
                      className="text-md font-light"
                      style={{ color: profileTheme.textSecondary }}
                    >
                      {artist?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8 w-full mt-1 mb-10">
                  {artist?.discord && (
                    <ProfileLink
                      isClipboard
                      username={artist?.discord}
                      social={"discord"}
                    />
                  )}
                  {artist?.twitter && (
                    <ProfileLink
                      link={`https://twitter.com/${artist?.twitter}`}
                      username={artist?.twitter}
                      social={"twitter"}
                    />
                  )}
                  {artist?.instagram && (
                    <ProfileLink
                      link={`https://www.instagram.com/${artist?.instagram}`}
                      username={artist?.instagram}
                      social={"instagram"}
                    />
                  )}
                  {artist?.website && (
                    <ProfileLink
                      link={artist?.website}
                      username={artist?.website}
                      social={"website"}
                    />
                  )}
                </div>

                <div>
                  <Divider />
                </div>
                <div
                  id="wallet-nav"
                  className="flex justify-start text-xs md:text-sm my-5"
                >
                  <TabList {...tab} aria-label="Wallet Tabs">
                    <Tab {...tab} id="tab1">
                      <p
                        style={{ color: profileTheme.textPrimary }}
                      >
                      Collection
                      </p>
                    </Tab>
                    <Tab {...tab} id="tab2">
                      <p
                        style={{ color: profileTheme.textPrimary }}
                      >
                      Creations
                      </p>
                    </Tab>
                  </TabList>
                </div>
                <TabPanel {...tab} >
                  <>{collection &&
                    <CreationsMasonry
                      arrayDisplay={collection}
                      arrayEdit={unlistedNfts}
                      edit={editCollection}
                      theme={profileTheme}
                      cancelEdit={cancelEditCollection}
                      saveChanges={saveChangesCollection}
                      isLoading={isLoadingMasonry}
                      isOwner={publicKey?.toString() == artist?.wallet_key.toString()} />}
                        </>
                </TabPanel>
                <TabPanel {...tab}>
                  <>{creations &&
                    <CreationsMasonry
                      arrayDisplay={creationsDisplay}
                      arrayEdit={creations}
                      edit={editCreations}
                      theme={profileTheme}
                      cancelEdit={cancelEditCreations}
                      saveChanges={saveChangesCreations}
                      isLoading={isLoadingMasonry}
                      isOwner={publicKey?.toString() == artist?.wallet_key.toString()}/>}
                        </>
                </TabPanel>

              </div>
            </div>
          </div>
        )}
        {userListDrawer && (
          <UserListModal
            onCloseClick={hideUserList}
            modalType={modalType}
            profile={artist?.username}
          />
        )}
      </>
    </Page>
  )
}
