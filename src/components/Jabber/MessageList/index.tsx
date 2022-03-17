import { Message } from "@bonfida/jabber"
import { BellIcon } from "@heroicons/react/outline"
import Wallet from "@project-serum/sol-wallet-adapter"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { useConnection, useWallet } from "../../../contexts"
import { useJabber } from "../../../contexts/jabber"
import { shortenAddress } from "../../../utils"
import { getDomainList } from "../../../utils/getDomainList"
import { DomainName } from "../../../utils/name-service"
import { LoadingWidget } from "../../loadingWidget"

interface MessageListProps {
  active?: string
  onClick: (name: string) => void
  activeDomain?: (domain: (DomainName | undefined)[] | undefined) => void
}

export const MessageList = ({
  onClick,
  active,
  activeDomain,
}: MessageListProps) => {
  const { threads, localMessageCount, messageCount } = useJabber()
  const { wallet } = useWallet()

  return (
    <>
      <span className="m-4 text-sm font-light ">Jabber messages</span>
      {threads ? (
        threads?.length > 0 ? (
          <ul className="w-full overflow-y-auto">
            {threads?.map((data) => {
              const currentThread =
                data.user2.toString() === wallet?.publicKey?.toString()
                  ? data.user1.toString()
                  : data.user2.toString()
              if (active === currentThread && activeDomain) {
                activeDomain(data?.userDomain)
              }
              const currentCount = messageCount?.find(
                (count) => count?.name === currentThread
              )
              const currentLocalCount = localMessageCount?.find(
                (count) => count?.name === currentThread
              )
              return (
                <li
                  key={currentThread}
                  className={`flex cursor-pointer m-2 ${
                    active === currentThread && "bg-gray-600"
                  } hover:bg-gray-600 p-2 rounded-md`}
                  onClick={() => onClick(currentThread)}
                >
                  <p className="m-auto ml-4 text-lg text-gray-200">
                    {data?.userDomain
                      ? getDomainList(data.userDomain)
                      : shortenAddress(currentThread)}
                  </p>
                  <p className="m-auto text-sm text-gray-200">{`Message count: ${data.msgCount}`}</p>
                  {currentLocalCount?.msgCount !== currentCount?.msgCount &&
                    !(active === currentThread) && (
                      <BellIcon className="w-4 h-auto text-solana-teal" />
                    )}
                </li>
              )
            })}
          </ul>
        ) : (
          <span className="text-center text-gray-500">
            No conversations to show
          </span>
        )
      ) : (
        <LoadingWidget />
      )}
    </>
  )
}
