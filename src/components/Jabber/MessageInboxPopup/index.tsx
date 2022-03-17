import { BellIcon } from "@heroicons/react/solid"
import { ChatAlt2Icon } from "@heroicons/react/outline"
import { Menu, Popover, Transition } from "@headlessui/react"

import * as ROUTES from "../../../constants/routes"
import { Fragment, useContext, useEffect, useState } from "react"
import { useHistory } from "react-router"
import { Profile } from "@bonfida/jabber"
import { MessageList } from "../MessageList"
import { useJabber } from "../../../contexts/jabber"
import { useConnection, useWallet } from "../../../contexts"
import SoloProfileContext from "../../../contexts/solo-profile"

export type Message = {
  name: string
  profilePic: string
  message: string
}

export const MessageInboxPopup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { messageCount, localMessageCount, setLocalMessageCount } = useJabber()
  const { push } = useHistory()
  const { getAllThreads } = useJabber()
  const { wallet } = useWallet()
  const connection = useConnection()
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext)

  const setMessageRoute = (name: string) => {
    push(`${ROUTES.INBOX}/${name}`)
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      getAllThreads(connection, wallet?.publicKey)
      setLocalMessageCount(
        localStorage.getItem(
          `localMessageObject:${wallet?.publicKey.toString()}`
        ) !== undefined
          ? JSON.parse(
              localStorage.getItem(
                `localMessageObject:${wallet?.publicKey.toString()}`
              ) as string
            )
          : []
      )
    }
  }, [wallet?.publicKey, isModalOpen])

  let totalLocalMessage: number = 0
  let totalMessage: number = 0
  localMessageCount?.map((count) =>
    count?.msgCount
      ? (totalLocalMessage = totalLocalMessage + count?.msgCount)
      : null
  )
  messageCount?.map((count) =>
    count?.msgCount ? (totalMessage = totalMessage + count?.msgCount) : null
  )

  return (
    <>
      <div
        className="relative flex items-center flex-1 my-2 h-10 w-10 z-60 cursor-pointer"
        onClick={() => setIsModalOpen(!isModalOpen)}
      >
        <Menu
          as="div"
          className="mx-3 relative inline-block text-left  opacity-90"
        >
          <Menu.Button className="text-white hover:text-gray-700">
            {totalMessage + totalLocalMessage > 0 &&
              messageCount !== undefined &&
              localMessageCount !== undefined &&
              totalLocalMessage !== totalMessage && (
                <BellIcon className="absolute w-4 h-auto text-solana-teal top-0 left-4" />
              )}
            <ChatAlt2Icon
              className="w-7 h-7"
              style={{
                color:
                  profileTheme && isProfilePage
                    ? profileTheme.headerForeground
                    : "",
              }}
            />
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
            <Menu.Items className="origin-top-right absolute right-0 mt-9 p-2 bg-gray-900 z-10 rounded-lg w-96 max-h-screen overflow-y-auto">
              <Menu.Item>
                {wallet?.publicKey ? (
                  <MessageList
                    onClick={(name: string) => setMessageRoute(name)}
                  />
                ) : (
                  <span className="mx-4 my-6 text-lg text-center">
                    Please connect a wallet to use Jabber onchain messaging.
                  </span>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  )
}
