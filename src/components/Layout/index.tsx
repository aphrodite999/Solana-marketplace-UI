import { PublicKey } from "@solana/web3.js"
import React, { useEffect, useState } from "react"
import { useConnection, useWallet } from "../../contexts"
import { getUserDomains } from "../../utils/name-service"
import { AppBar } from "../AppBar"
import Disclaimer from "../Disclaimer"
import { Footer } from "../Footer"

const DISCLAIMER_LOCAL_STORAGE_KEYS = {
  beta: "digitalEyesBetaDisclaimerClosed",
}

// !!!! If you change the disclaimer message, please don't forget to change the following storage key.
const CURRENT_DISCLAIMER_KEY = "beta"

export const Layout = React.memo((props: any) => {
  const { wallet } = useWallet()
  const [userDomains, setUserDomains] = useState<
    | (
        | {
            name: string
            nameKey: any
          }
        | {
            name: undefined
            nameKey: any
          }
      )[]
    | undefined
  >()

  const showDisclaimerLocalStorage =
    localStorage.getItem(
      DISCLAIMER_LOCAL_STORAGE_KEYS[CURRENT_DISCLAIMER_KEY]
    ) !== "true"
  const [showDisclaimer, setShowDisclaimer] = useState(
    showDisclaimerLocalStorage
  )

  const closeDisclaimer = () => {
    localStorage.setItem(
      DISCLAIMER_LOCAL_STORAGE_KEYS[CURRENT_DISCLAIMER_KEY],
      "true"
    )
    setShowDisclaimer(false)
  }

  const connection = useConnection()
  useEffect(() => {
    ;(async () => {
      if (wallet?.publicKey && !userDomains) {
        const domains = await getUserDomains(
          connection,
          wallet?.publicKey as PublicKey
        )
        setUserDomains(domains)
        console.log(domains)
      }
    })()
  }, [wallet?.publicKey, connection, userDomains])

  useEffect(() => {
    if (wallet && userDomains) wallet["domainNames"] = userDomains
  }, [wallet?.publicKey, userDomains])

  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      {showDisclaimer && <Disclaimer closeDisclaimer={closeDisclaimer} />}
      <main className="bg-color-main-tertiary flex-1">{props.children}</main>
      <Footer />
    </div>
  )
})
