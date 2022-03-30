import { Menu, Popover, Transition } from "@headlessui/react"
import {
  CogIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  UserCircleIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline"
// @ts-ignore
import { IKImage } from "imagekitio-react"
import { Fragment, useContext, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { MessageInboxPopup } from "../Jabber/MessageInboxPopup/index"
import { ReactComponent as DiscordLogo } from "../../assets/logo/discord.svg"
import { ReactComponent as TwitterLogo } from "../../assets/logo/twitter.svg"
import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images"
import {
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
} from "../../constants/urls"
import * as ROUTES from "../../constants/routes"
import { useCollections } from "../../contexts/collections"
import { useWallet } from "../../contexts/wallet"
import { SearchV2 } from "../SearchV2"
import { ConnectButton } from "../ConnectButton"
import { CurrentUserBadge } from "../CurrentUserBadge"
import { Settings } from "../Settings"
import { DE_DISCORD, DE_TWITTER } from "../../utils/DeSocials"
import { classNames } from "../../utils"
import { Divider } from "../Divider"
import { useLocation } from "react-router-dom"
import SoloProfileContext from "../../contexts/solo-profile"

export function AppBar() {
  const [checked, setChecked] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext)

  localStorage.setItem("theme", "theme-dark")

  const setTheme = (themeName: string) => {
    localStorage.setItem("theme", themeName)
    document.documentElement.className = themeName
  }

  useEffect(() => {
    if (localStorage.getItem("theme") === "theme-dark") {
      setChecked(true)
    }
  }, [])

  // function to toggle between light and dark theme
  const toggleTheme = () => {
    setChecked((c) => !c)
    if (localStorage.getItem("theme") === "theme-dark") {
      setTheme("theme-light")
    } else {
      setTheme("theme-dark")
    }
  }

  const history = useHistory()
  const { connected, wallet } = useWallet()
  const { collections, topCollections } = useCollections()
  const { pathname } = useLocation()

  useEffect(() => {
    setIsDropdownOpen(false)
  }, [history, pathname])

  return (
    <Popover
      className="bg-almost-black sticky top-0 z-50 digitaleyes-appbar transition"
      style={{
        background:
          isProfilePage && profileTheme ? profileTheme.headerBackground : "",
      }}
    >
      {({ open, close }) => (
        <>
          <div className="flex justify-between items-center px-4 sm:px-6 md:justify-start md:space-x-10 mx-auto shadow text-sm">
            <div className="flex justify-start xl:flex-auto md:h-20 h-12 items-center space-x-6">
              <Link
                to={ROUTES.HOME}
                onClick={() => close()}
                className="flex items-center"
              >
                <IKImage
                  urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                  path="/logo/digitaleyes.svg"
                  alt="digital eyes logo"
                  className="w-auto h-6 md:h-7.5"
                />
                <span className="text-white ml-2.5 mr-4 font-medium text-xl hidden sm:block">
                  DigitalEyes
                </span>
              </Link>

              <Link
                to={ROUTES.SOLO}
                onClick={() => close()}
                className="font-light text-white uppercase hidden xl:block hover:opacity-70"
                style={{
                  color:
                    isProfilePage && profileTheme
                      ? profileTheme.headerForeground
                      : "",
                }}
              >
                Solo
              </Link>
              <Link
                to={`${ROUTES.LAUNCHPAD}/featured`}
                onClick={() => close()}
                className="font-light text-white uppercase hidden xl:block transition hover:opacity-70"
                style={{
                  color:
                    isProfilePage && profileTheme
                      ? profileTheme.headerForeground
                      : "",
                }}
              >
                Launchpad
              </Link>
              <Link
                to={ROUTES.MINT_CALENDAR}
                onClick={() => close()}
                className="font-light text-white hover:text-gray-500 uppercase hidden xl:block"
              >
                Mint Calendar
              </Link>
            </div>

            <div className="flex-auto flex justify-center">
              <div className="text-sm md:text-base w-full lg:w-64 xl:w-72 bg-gray-900 mx-8 lg:mx-auto rounded-full">
                <SearchV2
                  collections={collections}
                  topCollections={topCollections}
                  onClose={close}
                  history={history}
                  darkMode={true}
                  wallet={wallet}
                />
              </div>
            </div>

            {/*
            <button onClick={toggleTheme}>
              <SunIcon className="w-5 h-5 text-white" />
            </button>
            */}

            <div className="-mr-2 -my-2 xl:hidden">
              <Popover.Button className="bg-almost-black p-2 inline-flex items-center justify-center text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                <span className="sr-only">Open menu</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>
            <Popover.Group
              as="nav"
              className="hidden xl:flex space-x-6 items-center"
            >
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="text-white hover:text-gray-700 uppercase flex items-stretch">
                  <span
                    style={{
                      color:
                        isProfilePage && profileTheme
                          ? profileTheme.headerForeground
                          : "",
                    }}
                    className="inline"
                  >
                    Explore
                  </span>
                  <ChevronDownIcon className="w-4 h-4 inline self-center ml-2 opacity-70" />
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
                  <Menu.Items className="flex flex-col origin-top-right absolute right-0 mt-11 p-2 bg-gray-900 z-10 rounded-lg w-48  overflow-y-auto">
                    <Menu.Item>
                      <button
                        onClick={(e: any) => {
                          history.push(`${ROUTES.SOLO_BROWSE}`)
                        }}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p> Solo</p>
                      </button>
                    </Menu.Item>
                    <Menu.Item>
                      <button
                        onClick={(e: any) => {
                          history.push(`${ROUTES.EXPLORE}`)
                        }}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p> All Collections </p>
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
              <Link
                to={
                  pathname.includes("solo") ? ROUTES.WALLET_SOLO : ROUTES.WALLET
                }
                onClick={() => close()}
                className="font-light text-white hover:text-gray-500 transition uppercase hover:opacity-70"
                style={{
                  color:
                    isProfilePage && profileTheme
                      ? profileTheme.headerForeground
                      : "",
                }}
              >
                Sell
              </Link>

              {connected && (
                <Link
                  to={
                    pathname.includes("solo")
                      ? ROUTES.FAVOURITE_LIST_SOLO
                      : ROUTES.FAVOURITE_LIST
                  }
                  className="font-light text-white hover:text-gray-500 uppercase transition hover:opacity-70"
                  style={{
                    color:
                      isProfilePage && profileTheme
                        ? profileTheme.headerForeground
                        : "",
                  }}
                >
                  Favorites
                </Link>
              )}


            <Menu as="div" className="mx-3 relative inline-block text-left">
                <Menu.Button className="text-white hover:text-gray-700 uppercase flex items-stretch">
                  <span
                    style={{
                      color:
                        isProfilePage && profileTheme
                          ? profileTheme.headerForeground
                          : "",
                    }}
                    className="inline"
                  >
                    Resources
                  </span>
                  <ChevronDownIcon className="w-4 h-4 inline self-center ml-2 opacity-70" />
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
                  <Menu.Items className="flex flex-col origin-top-right absolute right-0 mt-11 p-2 bg-gray-900 z-10 rounded-lg w-48 overflow-y-auto">
                  <Menu.Item>
                      <a
                        href={ROUTES.FAQ}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>FAQ</p>
                      </a>
                    </Menu.Item>

                    <Menu.Item>
                      <a
                        href={ROUTES.GUIDES}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>Guides</p>
                      </a>
                    </Menu.Item>


                    <Menu.Item>
                      <a
                        href={ROUTES.BLOG}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>Blog</p>
                      </a>
                    </Menu.Item>

                    {/* <Menu.Item>
                      <a
                        href={ROUTES.SUPPORT}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>Support</p>
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        href={ROUTES.NEWS}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>News</p>
                      </a>
                    </Menu.Item> */}


                  </Menu.Items>
                </Transition>
              </Menu>

              <Menu as="div" className="mx-3 relative inline-block text-left">
                <Menu.Button className="text-white hover:text-gray-700 uppercase flex items-stretch">
                  <span
                    style={{
                      color:
                        isProfilePage && profileTheme
                          ? profileTheme.headerForeground
                          : "",
                    }}
                    className="inline"
                  >
                    Apply
                  </span>
                  <ChevronDownIcon className="w-4 h-4 inline self-center ml-2 opacity-70" />
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
                  <Menu.Items className="flex flex-col origin-top-right absolute right-0 mt-11 p-2 bg-gray-900 z-10 rounded-lg w-96  overflow-y-auto">
                    <Menu.Item>
                      <a
                        target="_blank"
                        href="https://de-creators-portal.netlify.app/"
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p> Apply for Listing</p>
                        <ExternalLinkIcon className="w-5 h-5 opacity-80" />
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        target="_blank"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdDBxeZgKF5C3K5C-8pqoawIma2qaIFC18WYFk1NZHWZd_s3g/viewform"
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>Apply for Marketing/Collaborations</p>
                        <ExternalLinkIcon className="w-5 h-5 opacity-80" />
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a
                        target="_blank"
                        href="https://docs.google.com/forms/d/e/1FAIpQLScm9bt4ORJqRJgxsUdhhR_c7bwmek8_1PVU6_gbc3WyMdbiBg/viewform?usp=sf_link"
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p>Apply for Launchpad</p>
                        <ExternalLinkIcon className="w-5 h-5 opacity-80" />
                      </a>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>


            </Popover.Group>

            <div className="hidden xl:flex items-center justify-end">
              <WalletConnector />
            </div>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel
              focus
              static
              className="absolute top-0 inset-x-0 z-10 transition transform origin-top-right xl:hidden"
            >
              <div className="ring-1  max-h-screen overflow-auto ring-white ring-opacity-5 p-2 bg-gray-900">
                <div className="pt-5 pb-6 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        to={ROUTES.HOME}
                        onClick={() => close()}
                        className="flex items-center"
                      >
                        <IKImage
                          urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                          path="/logo/digitaleyes.svg"
                          alt="digital eyes logo"
                          className="w-auto h-6 md:h-7.5"
                        />
                        <span className="text-white ml-2.5 mr-4 font-medium text-base">
                          DigitalEyes
                        </span>
                      </Link>
                    </div>
                    <div className="-mr-2">
                      <Popover.Button className="bg-almost-black border border-white p-2 inline-flex items-center justify-center text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 rounded-md">
                        <span className="sr-only">Close menu</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <nav className="grid grid-cols-1 gap-7">
                      <Link
                        to={ROUTES.HOME}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Home
                        </div>
                      </Link>
                      <Link
                        to={ROUTES.SOLO_BROWSE}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Explore Solo
                        </div>
                      </Link>
                      <Link
                        to={ROUTES.EXPLORE}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Explore All Collections
                        </div>
                      </Link>

                      <Link
                        to={
                          pathname.includes("solo")
                            ? ROUTES.WALLET_SOLO
                            : ROUTES.WALLET
                        }
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Sell
                        </div>
                      </Link>

                      <Link
                        to={
                          pathname.includes("solo")
                            ? ROUTES.SOLO_FAQ
                            : ROUTES.FAQ
                        }
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          FAQ
                        </div>
                      </Link>

                      <Link
                        to={ROUTES.BLOG}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Blog
                        </div>
                      </Link>

                      <Link
                        to={ROUTES.GUIDES}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Guides 
                        </div>
                      </Link>

                      <Link
                        to={ROUTES.CREATOR_GUIDES}
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          Creator Guides 
                        </div>
                      </Link>


                      {connected && (
                        <Link
                          to={
                            pathname.includes("solo")
                              ? ROUTES.FAVOURITE_LIST_SOLO
                              : ROUTES.FAVOURITE_LIST
                          }
                          onClick={() => close()}
                          className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                        >
                          Favorites
                        </Link>
                      )}

                      <Divider />

                      <Link
                        to={
                          pathname.includes("solo") ? ROUTES.HOME : ROUTES.SOLO
                        }
                        onClick={() => close()}
                        className="-m-3 p-3 flex items-center"
                      >
                        <div className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl">
                          solo
                        </div>
                      </Link>

                      <Link
                        to={`${ROUTES.LAUNCHPAD}/featured`}
                        onClick={() => close()}
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        LAUNCHPAD
                      </Link>
                      <Link
                        to={ROUTES.MINT_CALENDAR}
                        onClick={() => close()}
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        Mint Calendar
                      </Link>
                      {/* <Link
                        to={ROUTES.FEEDBACK}
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        FEEDBACK
                      </Link> */}
                      <a
                        target="_blank"
                        href="https://de-creators-portal.netlify.app/"
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        Apply for Listing
                      </a>
                      <a
                        target="_blank"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdDBxeZgKF5C3K5C-8pqoawIma2qaIFC18WYFk1NZHWZd_s3g/viewform"
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        Apply for Marketing/Collaborations
                      </a>
                      <a
                        target="_blank"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSc-U7peZLpIfxiiCx8AzXrhDVaqSh7xiMG299cpoNjnWGrQ6A/viewform"
                        className="ml-3 font-light text-white uppercase hover:text-gray-500 text-xl"
                      >
                        Apply for Launchpad
                      </a>
                    </nav>
                  </div>
                </div>
                <div className="py-4 px-5">
                  <div className="flex items-center justify-center mb-5">
                    <WalletConnector />
                  </div>

                  <div className="mt-4 mx-10 flex justify-center space-x-12">
                    <a
                      href={DE_TWITTER}
                      target="_blank"
                      className="text-white hover:text-gray-500"
                      rel="noreferrer"
                    >
                      <TwitterLogo className="h-8 w-8" />
                    </a>
                    <a
                      href={DE_DISCORD}
                      target="_blank"
                      className="text-white hover:text-gray-500"
                      rel="noreferrer"
                    >
                      <DiscordLogo className="h-8 w-8" />
                    </a>
                    {/* <a href="#" className="text-white hover:text-gray-500">
                      <TelegramLogo className="h-8 w-8" />
                    </a> */}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
          <Divider />
        </>
      )}
    </Popover>
  )
}

const WalletConnector = (props: any) => {
  const { connected, wallet } = useWallet()
  const history = useHistory()
  const { pathname } = useLocation()
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext)
  const [userProf, setUserProf] = useState<any>("")

  const goToCreateProfile = () => {
    history.push(`${ROUTES.SOLO_SETTINGS}`)
  }

  const goToProfile = () => {
    history.push(`${ROUTES.SOLOPROFILE}/${userProf?.username}`)
  }

  const getProfAuth = async () => {
    const pubKey = wallet?.publicKey
    try {
      const profAuthed = await fetch(
        `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${pubKey?.toBase58()}`
      ).then((res) => {
        if (res.status == 200) {
          return res.json()
        } else {
          throw new Error()
        }
      })

      setUserProf(profAuthed)
    } catch (error) {
      setUserProf("")
      console.log("Unable to fetch profile info", error)
    }
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      getProfAuth()
    }
  }, [connected])

  return (
    <>
      {connected && <MessageInboxPopup />}
      {!connected && <ConnectButton allowWalletChange={true} />}
      {(connected || process.env.NODE_ENV === "development") && (
        <Menu
          as="div"
          className="mx-3 relative inline-block text-left  opacity-90"
        >
          {connected ? (
            <Menu.Button className="rounded-full flex items-center text-white hover:text-gray-700 outline-none">
              <span className="sr-only">Open options</span>
              {userProf?.image ? (
                <img
                  src={userProf?.image}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon
                  className="h-7 w-7 opacity-90 transition hover:opacity-70"
                  style={{
                    color:
                      isProfilePage && profileTheme
                        ? profileTheme.headerForeground
                        : "",
                  }}
                  aria-hidden="true"
                />
              )}
            </Menu.Button>
          ) : (
            <div className="grid grid-cols-1">
              <Menu.Button className="rounded-full flex items-center text-white hover:text-gray-700 outline-none">
                <span className="sr-only">Open options</span>
                <CogIcon
                  className="h-5 w-5 opacity-80 transition hover:opacity-70"
                  aria-hidden="true"
                  style={{
                    color:
                      isProfilePage && profileTheme
                        ? profileTheme.headerForeground
                        : "",
                  }}
                />
              </Menu.Button>
            </div>
          )}

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-8 p-5 w-64  bg-gray-900 z-10 rounded-lg">
              {connected && userProf?.username && (
                <Menu.Item>
                  <div className="text-center text-xl">
                    <span>{userProf?.username}</span>
                  </div>
                </Menu.Item>
              )}

              <Menu.Item>{(props) => <CurrentUserBadge />}</Menu.Item>

              {connected && userProf?.username && (
                <div className="flex justify-center">
                  <Menu.Item>
                    <button
                      type="submit"
                      className="w-full items-center px-3 py-2 shadow-sm text-sm leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                      onClick={goToProfile}
                    >
                      My Profile
                    </button>
                  </Menu.Item>
                </div>
              )}
              {connected && !userProf?.username && (
                <Menu.Item>
                  <button
                    type="submit"
                    className="w-full items-center px-3 py-2 shadow-sm text-md leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                    onClick={goToCreateProfile}
                  >
                    Create a Profile
                  </button>
                </Menu.Item>
              )}
              <div className="py-1 space-y-3">
                {process.env.NODE_ENV === "development" && (
                  <Menu.Item>{({ active }) => <Settings />}</Menu.Item>
                )}
              </div>
              <Menu.Item>
                {(props) => <DisconnectButton {...props} />}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </>
  )
}

const DisconnectButton = (props: any) => {
  const { connected, disconnect } = useWallet()
  if (connected) {
    return (
      <button
        type="submit"
        className="w-full items-center justify-center px-3 py-2 shadow-sm text-xs leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
        onClick={() => {
          props.onClick()
          disconnect()
        }}
      >
        Disconnect
      </button>
    )
  }
  return null
}
