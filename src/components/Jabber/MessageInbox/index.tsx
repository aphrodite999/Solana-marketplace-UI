import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"
import * as ROUTES from "../../../constants/routes"
import { useConnection, useWallet } from "../../../contexts"
import { useJabber } from "../../../contexts/jabber"
import { toPublicKey } from "../../../utils"
import { DomainName, getUserDomains } from "../../../utils/name-service"
import { NoWalletOrFavourites } from "../../../views/favourite-list/noWalletOrFavourites"
import { NotificationModal } from "../../NotificationModal"
import { Page } from "../../Page"
import { ChatRoom } from "../ChatRoom"
import { MessageList } from "../MessageList"

interface MessageInboxUrlParamProps {
  recipient: string
}

export const MessageInbox = () => {
  const { getAllThreads } = useJabber()
  const [recipientDomains, setRecipientDomains] =
    useState<(DomainName | undefined)[]>()
  const { wallet } = useWallet()
  const { push } = useHistory()
  const { recipient }: MessageInboxUrlParamProps = useParams()
  const setMessageRoute = (name: string) => {
    push(`${ROUTES.INBOX}/${name}`)
  }
  const connection = useConnection()

  useEffect(() => {
    if (wallet?.publicKey) {
      getAllThreads(connection, wallet?.publicKey)
    }
  }, [wallet?.publicKey])

  useEffect(() => {
    ;(async () => {
      if (!recipientDomains) {
        setRecipientDomains(
          await getUserDomains(connection, toPublicKey(recipient))
        )
      }
    })()
  }, [connection, recipient])

  return (
    <Page>
      {wallet?.publicKey ? (
        <div className="flex w-full h-screen-no-nav">
          <>
            <div className="flex flex-col w-1/3">
              <MessageList
                activeDomain={(
                  domain: (DomainName | undefined)[] | undefined
                ) => setRecipientDomains(domain)}
                active={recipient}
                onClick={(name: string) => setMessageRoute(name)}
              />
            </div>
            <div className="w-2/3 bg-gray-900">
              <ChatRoom domains={recipientDomains} recipient={recipient} />
            </div>{" "}
          </>
        </div>
      ) : (
        <NoWalletOrFavourites
          title="No wallet connected"
          description="Please connect a wallet to use Jabber onchain messaging."
        />
      )}
    </Page>
  )
}
