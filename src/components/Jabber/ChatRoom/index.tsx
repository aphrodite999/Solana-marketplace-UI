import {
  Message,
  MessageType,
  signAndSendTransactionInstructions,
  Thread,
} from "@bonfida/jabber"
import { PublicKey } from "@solana/web3.js"
import { Input } from "antd"
import React, { useEffect, useState } from "react"
import { useConnection, useWallet } from "../../../contexts"
import { useJabber } from "../../../contexts/jabber"
import { shortenAddress, toPublicKey } from "../../../utils"
import { getDomainList } from "../../../utils/getDomainList"
import { DomainName } from "../../../utils/name-service"
import { LoadingWidget } from "../../loadingWidget"

interface ChatRoomProps {
  recipient: string
  domains: (DomainName | undefined)[] | undefined
}

export const ChatRoom = ({ recipient, domains }: ChatRoomProps) => {
  const [message, setMessage] = useState<string>()
  const [chatLoading, setChatLoading] = useState(false)
  const [messageThread, setMessageThread] = useState<
    | (
        | {
            message: Message
            address: PublicKey
          }
        | undefined
      )[]
    | undefined
  >()
  const {
    getMessages,
    sendUserMessage,
    hasThread,
    startThread,
    messageCount,
    updateLocalMessageCount,
  } = useJabber()
  const { wallet } = useWallet()
  const [doesThreadExist, setDoesThreadExist] = useState<Boolean>()
  const connection = useConnection()

  useEffect(() => {
    if (wallet?.publicKey && recipient && messageCount) {
      updateLocalMessageCount(recipient, wallet?.publicKey?.toString())
    }
  }, [recipient, wallet?.publicKey, messageCount])

  useEffect(() => {
    ;(async () => {
      if (wallet?.publicKey && recipient) {
        setDoesThreadExist(
          await hasThread(connection, wallet?.publicKey, toPublicKey(recipient))
        )
        if (doesThreadExist) {
          setChatLoading(true)
          setMessageThread(
            await getMessages(
              connection,
              wallet?.publicKey,
              toPublicKey(recipient)
            )
          )
          setChatLoading(false)
        }
      }
    })()
  }, [wallet?.publicKey, recipient, connection, doesThreadExist])

  const sendMessage = async () => {
    ;(async () => {
      if (wallet?.publicKey && recipient && message) {
        setChatLoading(true)
        try {
          await sendUserMessage(
            connection,
            wallet,
            wallet?.publicKey,
            toPublicKey(recipient),
            new TextEncoder().encode(message),
            MessageType.Unencrypted
          )
          setMessageThread(
            await getMessages(
              connection,
              wallet?.publicKey as PublicKey,
              toPublicKey(recipient)
            )
          )
          setMessage(undefined)
          setChatLoading(false)
        } catch (err) {
          console.log(err)
          setChatLoading(false)
        }
      }
    })()
  }

  const createThread = async () => {
    if (wallet && wallet.publicKey) {
      setChatLoading(true)
      try {
        await startThread(
          connection,
          wallet,
          wallet?.publicKey,
          toPublicKey(recipient)
        )
        setDoesThreadExist(
          await hasThread(
            connection,
            wallet?.publicKey as PublicKey,
            toPublicKey(recipient)
          )
        )
        setChatLoading(false)
      } catch (err) {
        setChatLoading(false)
      }
    }
  }

  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="flex w-full h-full overflow-auto mb-14 pt-10">
        <div className="absolute flex w-full top-0 left-0">
          <span className="p-4">
            {domains ? getDomainList(domains) : shortenAddress(recipient)}
          </span>
        </div>
        {doesThreadExist !== undefined ? (
          doesThreadExist ? (
            !chatLoading ? (
              <ul className="flex flex-col w-full overflow-y-auto">
                {messageThread?.map((message) => (
                  <li
                    key={message?.message.timestamp.toString()}
                    className={`my-6 mx-12 px-14 py-6 rounded-t-xl max-w-md overflow-hidden ${
                      message?.message.sender.toBase58() ===
                      wallet?.publicKey?.toBase58()
                        ? "ml-auto rounded-bl-xl bg-solana-teal text-black"
                        : "mr-auto rounded-br-xl bg-solana-magenta"
                    }`}
                  >
                    {Buffer.from(message?.message?.msg as Buffer).toString()}
                  </li>
                ))}
              </ul>
            ) : (
              <LoadingWidget />
            )
          ) : (
            <>
              {!chatLoading ? (
                <span className="m-auto">
                  Create a thread to begin chatting with{" "}
                  {domains ? getDomainList(domains) : shortenAddress(recipient)}
                </span>
              ) : (
                <LoadingWidget />
              )}
            </>
          )
        ) : (
          <LoadingWidget />
        )}
      </div>
      <div className="absolute flex w-full bg-gray-900 mb-0 bottom-0 left-0">
        {doesThreadExist !== undefined &&
          recipient &&
          (doesThreadExist ? (
            <>
              <Input
                autoFocus
                className="m-2 flex-1 bg-transparent rounded-lg border border-color-main-gray-medium p-2 my-1 text-xs md:text-md inline"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage} className="btn m-2">
                send message
              </button>
            </>
          ) : (
            <button
              onClick={createThread}
              className="btn m-4 mx-auto py-6 px-12"
            >
              Create thread
            </button>
          ))}
      </div>
    </div>
  )
}
