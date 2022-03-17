import { createContext, useContext, useState } from "react"
import { Props } from "react-select"
import {
  NameAuction,
  decodeAuction,
  findActiveAuctionsForUser,
  performReverseLookup,
  AuctionData,
  PROGRAM_ID,
  FIDA_MINT,
  AUCTION_ID,
  resellDomain,
  SOL_TLD_AUTHORITY,
  BuyNowData,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  placeBid,
  getDomainKey,
  getBidderPotKey,
  createAccount,
  claimName,
  BONFIDA_SOL_VAULT,
  reclaimName,
  cancelBid,
  getDestinationTokenAccount,
  getMultipleAccountInfo,
} from "@bonfida/name-auctioning"
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  Keypair,
  SystemProgram,
  AccountInfo,
} from "@solana/web3.js"
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { DomainName } from "../utils/name-service"
import { BONFIDA_DOMAINS_API } from "../constants/urls"
import BN from "bn.js"
import { sendTransaction, WalletAdapter } from "."
import { toPublicKey } from "../utils"
import { boolean } from "yup/lib/locale"
import { String } from "lodash"
import { NameRegistryState } from "@bonfida/spl-name-service"

type DomainListingContextProps = {
  getListedDomains: (
    connection: Connection,
    publicKey: PublicKey
  ) => Promise<(DomainName | undefined)[] | undefined>

  getAuctionInfo: (
    connection: Connection,
    domainName: string
  ) => Promise<DomainNameAndAuction | undefined>

  getActiveAuctionList: (connection: Connection) => Promise<boolean | undefined>

  domainList: DomainNameAndAuction[] | undefined

  resellUserDomain: (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    endDate: Date,
    domainKey: PublicKey,
    domainName: string,
    bid: number,
    maxPrice?: number
  ) => Promise<string | undefined>

  bidOnDomain: (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction,
    bid: number,
    isNearEnd: boolean,
  ) => Promise<string | undefined>

  cancelBidOnDomain: (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => Promise<string | undefined>

  claimDomain: (
    connection: Connection,
    wallet: WalletAdapter,
    domainKey: PublicKey,
    domainName: string,
    size?: number | undefined
  ) => Promise<string | undefined>

  reclaimDomain: (
    connection: Connection,
    wallet: WalletAdapter,
    domainKey: PublicKey,
    domainName: string
  ) => Promise<string | undefined>

  getActiveAuctionListByName: (
    connection: Connection,
    domainName: string
  ) => Promise<DomainNameAndAuction[] | undefined>

  getOwner: (
    connection: Connection,
    nameAccount: PublicKey
  ) => Promise<PublicKey | undefined>

  canCancelBid: (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => Promise<boolean>

  userHasBids: (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => Promise<boolean>

  isUserWinner: (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => Promise<boolean>

  getBuyNowPrice: (
    connection: Connection,
    domainName: string,
    domainKey?: PublicKey,
  ) => Promise<number | undefined>
}

const DomainListingContext = createContext<DomainListingContextProps>({
  getListedDomains: () => Promise.resolve({} as DomainName[]),
  getAuctionInfo: () => Promise.resolve({} as DomainNameAndAuction),
  getActiveAuctionList: () => Promise.resolve(true),
  resellUserDomain: () => Promise.resolve({} as string),
  domainList: undefined,
  bidOnDomain: () => Promise.resolve({} as string),
  cancelBidOnDomain: () => Promise.resolve({} as string),
  claimDomain: () => Promise.resolve({} as string),
  reclaimDomain: () => Promise.resolve({} as string),
  getActiveAuctionListByName: () =>
    Promise.resolve([] as DomainNameAndAuction[]),
  getOwner: () => Promise.resolve({} as PublicKey | undefined),
  canCancelBid: () => Promise.resolve({} as boolean),
  userHasBids: () => Promise.resolve({} as boolean),
  isUserWinner: () => Promise.resolve({} as boolean),
  getBuyNowPrice: () => Promise.resolve({} as number),
})

export type DomainNameAndAuction = DomainName & {
  auctionApiData?: AuctionApiData
  auctionData?: AuctionData
  auctionKey?: PublicKey 
  domainOwner?: PublicKey
}

export type AuctionApiData = {
  _id: string
  startTime: number
  endTime: number
  auctionKey: string
  domainName: string
  creator: string
  __v: 0
  maxBid: number
  tokenMint: string
  usdValue: null
}

export const DomainListingContextProvider = ({ children }: Props) => {
  const [domainList, setDomainList] = useState<DomainNameAndAuction[]>()

  const DE_FIDA_ASSOCIATED_ADDRESS = toPublicKey(
    "3Bot69iXbCRXKEgPdZTyo6Zoii868WiYzA9gPGH6qqgA"
  )
  const getOwner = async (
    connection: Connection,
    nameAccount: PublicKey
  ): Promise<PublicKey | undefined> => {
    try {
      let [resellingStateAccount] = await PublicKey.findProgramAddress(
        [nameAccount.toBytes(), Uint8Array.from([1, 1])],
        PROGRAM_ID
      )
      let destinationTokenData = (
        await connection.getAccountInfo(resellingStateAccount)
      )?.data
      if (!destinationTokenData) {
        throw "Could not retrieve reselling state. Is this a reselling auction?"
      }

      let info = await connection.getAccountInfo(
        new PublicKey(destinationTokenData)
      )

      let rawAccount = AccountLayout.decode(Buffer.from(info?.data as Buffer))
      return new PublicKey(rawAccount.owner)
    } catch (err) {
      console.log(err)
    }
  }

  const findAssociatedTokenAddress = async (
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> => {
    return (
      await PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )
    )[0]
  }

  const getListedDomains = async (
    connection: Connection,
    publicKey: PublicKey
  ) => {
    try {
      const response = await findActiveAuctionsForUser(connection, publicKey)
      const listedItemsArray = await Promise.all(
        response.map(async (listed) => {
          const data = await connection.getAccountInfo(listed, "confirmed")
          const auctionData = decodeAuction(data?.data as Buffer)
          const name = await performReverseLookup(connection, auctionData.resource)

          if (name) {
            const ownerWallet = await getOwner(connection, auctionData.resource)

            return {
              nameKey: auctionData.resource,
              name: name,
              auctionData: auctionData,
              auctionKey: listed,
              domainOwner: ownerWallet,
            } as DomainNameAndAuction
          }
        })
      )

      return listedItemsArray?.filter((item) => item)
    } catch (err) {
      console.log(err)
    }
  }

  const getAuctionInfo = async (connection: Connection, domainName: string) => {
    try {
      const { domainKey } = await getDomainKey(domainName)
      const keyInfo = await NameAuction.retrieve(connection, domainKey)
      const data = await connection.getAccountInfo(keyInfo.auctionAccount,"confirmed")
      const auctionData = decodeAuction(data?.data as Buffer)
      const name = await performReverseLookup(connection, auctionData.resource)
      const ownerWallet = await getOwner(connection, auctionData.resource)

      return {
        nameKey: auctionData.resource,
        name: name,
        domainOwner: ownerWallet,
        auctionData: auctionData,
        auctionKey: keyInfo.auctionAccount,
      } as DomainNameAndAuction
    } catch (err) {
      console.log(err)
    }
  }

  const getActiveAuctionList = async (connection: Connection) => {
    try {
      const endTime = domainList
        ? (domainList[domainList.length - 1]?.auctionApiData
            ?.endTime as number) + 3600000
        : new Date().getTime() + 3600000

      const sort = domainList ? -1 : 1
      const response = await fetch(
        `${BONFIDA_DOMAINS_API}search?endTime=${endTime}&sort=${sort}`
      )
      const responseJson = await response.json()

      const filteredList = responseJson.auctions.filter(
        (auction: AuctionApiData) =>
          domainList
            ? !domainList.find(
                (domain) => domain?.auctionApiData?._id === auction._id
              )
            : auction
      )

      if (sort == -1) {
        filteredList.reverse()
      }

      let keys: PublicKey[] = []
      let result: (AccountInfo<Buffer> | null)[] = []
      let counter = 0
      filteredList.map(async (domain: AuctionApiData) => {
        keys.push(toPublicKey(domain.auctionKey))
        counter++

        if (counter == 100) {
          result.push(...(await getMultipleAccountInfo(connection, keys)))
          counter = 0
          keys = []
        }
      })

      result.push(...(await getMultipleAccountInfo(connection, keys)))

      const updatedList: DomainNameAndAuction[] = await Promise.all(
        filteredList.map(async (domain: AuctionApiData, i: number) => {
          return {
            auctionApiData: domain,
            auctionData: decodeAuction(result[i]?.data as Buffer),
            auctionKey: keys[i]
          } as DomainNameAndAuction
        })
      )
      const domains = domainList ? domainList : []
      setDomainList([...domains, ...updatedList])
      return true
    } catch (err) {
      console.log(err)
    }
  }

  const getActiveAuctionListByName = async (
    connection: Connection,
    domainName: string
  ) => {
    try {
      const endTime = new Date().getTime() + 100000000000000

      const response = await fetch(
        `${BONFIDA_DOMAINS_API}search?endTime=${endTime}&keyword=${domainName}`
      )
      const responseJson = await response.json()

      const updatedList: DomainNameAndAuction[] = await Promise.all(
        responseJson.auctions.map(async (domain: AuctionApiData) => {
          let auctionData

          const data = await connection.getAccountInfo(
            toPublicKey(domain.auctionKey),
            "confirmed"
          )

          auctionData = decodeAuction(data?.data as Buffer)

          return {
            auctionApiData: domain,
            auctionData: auctionData,
            auctionKey: toPublicKey(domain.auctionKey)
          } as DomainNameAndAuction
        })
      )

      return updatedList
    } catch (err) {
      console.log(err)
    }
  }

  const resellUserDomain = async (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    endDate: Date,
    domainKey: PublicKey,
    domainName: string,
    bid: number,
    maxPrice?: number
  ) => {
    try {
      // End time
      const now = new Date()
      const delta = (now.getTime() - endDate.getTime()) / 1000 // in s

      const userQuoteAccount = await findAssociatedTokenAddress(
        publicKey,
        FIDA_MINT
      )

      // If the seller wants the ability to sell immediately
      const buyNowKey = maxPrice ? await BuyNowData.key(domainKey) : undefined
      const parsedMaxPrice = maxPrice
        ? new BN(maxPrice).muln(Math.pow(10, 6))
        : undefined

      const [, instructions] = await resellDomain(
        domainKey,
        domainName,
        publicKey,
        publicKey,
        userQuoteAccount,
        SOL_TLD_AUTHORITY,
        new BN(bid).muln(Math.pow(10, 6)),
        delta,
        parsedMaxPrice,
        buyNowKey
      )

      if (instructions) {
        const txId = await sendTransaction(
          connection,
          wallet,
          instructions,
          [],
          true
        )

        const keyInfo = await NameAuction.retrieve(connection, domainKey)

        const payload = {
          auctionKey: keyInfo.auctionAccount.toBase58(),
          endTime: endDate.getTime(),
        }

        await fetch(`${BONFIDA_DOMAINS_API}/update/`, {
          method: "POST",
          body: JSON.stringify(payload),
        })

        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const bidOnDomain = async (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction,
    bid: number,
    isNearEnd: boolean,
  ) => {
    try {
      if (!domain.auctionData) {
        const domainInfo = await getAuctionInfo(connection, domain.name)
        if (domainInfo) {
          domain = domainInfo
        }
      }

      if (!domain.auctionData) return

      const auctionKey = domain.auctionKey
      if (!auctionKey) return

      const bidderPotPubkey = await getBidderPotKey({
        auctionProgramId: AUCTION_ID,
        bidderPubkey: wallet.publicKey as PublicKey,
        auctionKey: auctionKey,
      })

      let [bidderPotTokenPubkey, nonce] = await PublicKey.findProgramAddress(
        [bidderPotPubkey.toBuffer()],
        AUCTION_ID
      )

      const userQuoteAccount = await findAssociatedTokenAddress(
        wallet.publicKey as PublicKey,
        FIDA_MINT
      )

      const buyNowData = await BuyNowData.retrieve(connection, domain.auctionData.resource)

      let instructions: TransactionInstruction[] = []
      await placeBid(
        wallet.publicKey as PublicKey,
        userQuoteAccount, // FIDA account
        bidderPotTokenPubkey, // cf _Creating bidder pot account_ section
        domain.auctionData.tokenMint,
        wallet.publicKey as PublicKey,
        wallet.publicKey as PublicKey,
        domain.auctionData.resource, // The resource being auctioned is the domain name i.e resource = domain name key
        buyNowData ? await BuyNowData.key(domain.auctionData.resource) : undefined,
        new BN(bid * Math.pow(10, 6)),
        instructions
      )

      if (instructions) {
        const txId = await sendTransaction(
          connection,
          wallet,
          instructions,
          [],
          true
        )
        
        if (isNearEnd) {
          const data = await connection.getAccountInfo(
            auctionKey,
            "confirmed"
          )
          domain.auctionData = decodeAuction(data?.data as Buffer)

          const payload = {
            auctionKey: auctionKey,
            endTime: domain.auctionData.endedAt?.toNumber(),
          }

          await fetch(`${BONFIDA_DOMAINS_API}/update/`, {
            method: "POST",
            body: JSON.stringify(payload),
          })
        }

        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const claimDomain = async (
    connection: Connection,
    wallet: WalletAdapter,
    domainKey: PublicKey,
    domainName: string,
    size?: number
  ) => {
    try {
      let [resellingStateAccount] = await PublicKey.findProgramAddress(
        [domainKey.toBytes(), Uint8Array.from([1, 1])],
        PROGRAM_ID
      )

      const keyInfo = await NameAuction.retrieve(connection, domainKey)

      let destinationTokenData = (
        await connection.getAccountInfo(resellingStateAccount)
      )?.data

      const rent = await connection.getMinimumBalanceForRentExemption(
        size ? size + NameRegistryState.HEADER_LEN : 0
      )

      const buyNowKey = await BuyNowData.key(domainKey)

      const fidaAccount = await findAssociatedTokenAddress(
        wallet.publicKey as PublicKey,
        FIDA_MINT
      )

      const bidderPotPubkey = await getBidderPotKey({
        auctionProgramId: AUCTION_ID,
        bidderPubkey: wallet.publicKey as PublicKey,
        auctionKey: keyInfo.auctionAccount,
      })

      let [bidderPotTokenPubkey, nonce] = await PublicKey.findProgramAddress(
        [bidderPotPubkey.toBuffer()],
        AUCTION_ID
      )

      const [, instructions] = await claimName(
        connection,
        domainKey,
        domainName,
        wallet.publicKey as PublicKey,
        FIDA_MINT,
        wallet.publicKey as PublicKey,
        bidderPotPubkey,
        bidderPotTokenPubkey,
        new BN(rent),
        size ? size : 0,
        SOL_TLD_AUTHORITY,
        destinationTokenData ? true : false,
        // fidaAccount, // Discount account
        SystemProgram.programId, // checking other bonfida transcations, the discount transaction is systemProgram
        buyNowKey,
        BONFIDA_SOL_VAULT,
        false,
        destinationTokenData
          ? new PublicKey((destinationTokenData as Buffer).slice(0, 32))
          : undefined,
        DE_FIDA_ASSOCIATED_ADDRESS
      )

      if (instructions) {
        const txId = await sendTransaction(
          connection,
          wallet,
          instructions,
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const reclaimDomain = async (
    connection: Connection,
    wallet: WalletAdapter,
    domainKey: PublicKey,
    domainName: string
  ) => {
    try {
      let [resellingStateAccount] = await PublicKey.findProgramAddress(
        [domainKey.toBytes(), Uint8Array.from([1, 1])],
        PROGRAM_ID
      )
      let destinationTokenData = (
        await connection.getAccountInfo(resellingStateAccount)
      )?.data

      const buyNowKey = await BuyNowData.key(domainKey)

      const fidaAccount = await findAssociatedTokenAddress(
        wallet.publicKey as PublicKey,
        FIDA_MINT
      )

      const [, instructions] = await reclaimName(
        connection,
        domainKey,
        domainName,
        wallet.publicKey as PublicKey,
        FIDA_MINT,
        wallet.publicKey as PublicKey,
        SOL_TLD_AUTHORITY,
        false,
        new PublicKey(destinationTokenData as Buffer),
        buyNowKey,
        BONFIDA_SOL_VAULT,
        fidaAccount,
        false
      )

      if (instructions) {
        const txId = await sendTransaction(
          connection,
          wallet,
          instructions,
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const cancelBidOnDomain = async (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => {
    try {
      if (!wallet.publicKey) return
      if (!domain.auctionData) {
        const domainInfo = await getAuctionInfo(connection, domain.name)
        if (domainInfo) {
          domain = domainInfo
        }
      }

      if (!domain.auctionData) return

      const auctionKey = domain.auctionKey
      if (!auctionKey) return

      const bidderPotPubkey = await getBidderPotKey({
        auctionProgramId: AUCTION_ID,
        bidderPubkey: wallet.publicKey,
        auctionKey: auctionKey,
      })

      let [bidderPotTokenPubkey, nonce] = await PublicKey.findProgramAddress(
        [bidderPotPubkey.toBuffer()],
        AUCTION_ID
      )
      
      const fidaAccount = await findAssociatedTokenAddress(
        wallet.publicKey,
        FIDA_MINT
      )

      let instructions: TransactionInstruction[] = []
      await cancelBid(
        wallet.publicKey,
        fidaAccount, // FIDA user account
        bidderPotTokenPubkey, // cf _Creating bidder pot account_ section
        FIDA_MINT,
        domain.auctionData.resource, // The resource being auctioned is the domain name i.e resource = domain name key
        instructions
      )

      if (instructions) {
        const txId = await sendTransaction(
          connection,
          wallet,
          instructions,
          [],
          true
        )

        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const canCancelBid = async (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => {
    try {
      if (!domain.auctionData) {
        const domainInfo = await getAuctionInfo(connection, domain.name)
        if (domainInfo) {
          domain = domainInfo
        }
      }

      if (!domain.auctionData) return false

      const auctionKey = domain.auctionKey
      if (!auctionKey) return false

      const bidderPotPubkey = await getBidderPotKey({
        auctionProgramId: AUCTION_ID,
        bidderPubkey: wallet.publicKey as PublicKey,
        auctionKey: auctionKey,
      })

      if (domain.auctionData.bidState.bids.length == 0) {
        return false
      }

      if (domain.auctionData.bidState.bids[0].key.toBase58() == bidderPotPubkey.toBase58()) {
        // current bid winner
        return false
      }

      let [bidderPotTokenPubkey, nonce] = await PublicKey.findProgramAddress(
        [bidderPotPubkey.toBuffer()],
        AUCTION_ID
      )

      const balance = await connection.getTokenAccountBalance(
        bidderPotTokenPubkey,
        "confirmed"
      )

      if (balance.value.uiAmount == 0.0) {
        return false
      }

      return true
    } catch (err) {
      console.log(err)
    }
    return false
  }

  const userHasBids = async (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction,
  ) => {
    try {
      if (!domain.auctionData) {
        const domainInfo = await getAuctionInfo(connection, domain.name)
        if (domainInfo) {
          domain = domainInfo
        }
      }

      if (!domain.auctionData) return false

      const auctionKey = domain.auctionKey
      if (!auctionKey) return false

      const bidderPotPubkey = await getBidderPotKey({
        auctionProgramId: AUCTION_ID,
        bidderPubkey: wallet.publicKey as PublicKey,
        auctionKey: auctionKey,
      })

      let [bidderPotTokenPubkey, nonce] = await PublicKey.findProgramAddress(
        [bidderPotPubkey.toBuffer()],
        AUCTION_ID
      )

      const balance = await connection.getTokenAccountBalance(
        bidderPotTokenPubkey,
        "confirmed"
      )

      if (balance.value.uiAmount == 0.0) {
        return false
      }

      return true
    } catch (err) {
      console.log(err)
    }
    return false
  }

  const isUserWinner = async (
    connection: Connection,
    wallet: WalletAdapter,
    domain: DomainNameAndAuction
  ) => {
    if (!domain.auctionData) {
      const domainInfo = await getAuctionInfo(connection, domain.name)
      if (domainInfo) {
        domain = domainInfo
      }
    }

    if (!domain.auctionData) return false

    const auctionKey = domain.auctionKey
    if (!auctionKey) return false

    const bidderPotPubkey = await getBidderPotKey({
      auctionProgramId: AUCTION_ID,
      bidderPubkey: wallet.publicKey as PublicKey,
      auctionKey: auctionKey,
    })
    const isWinner =
      domain?.auctionData?.bidState.bids[
        domain?.auctionData.bidState.bids.length - 1
      ]?.key.toString() === bidderPotPubkey?.toString()

    return isWinner
  }

  const getBuyNowPrice = async (connection: Connection, domainName: string, domainKey?: PublicKey ) => {
    if (domainKey == undefined) {
      const result = await getDomainKey(domainName)
      domainKey = result.domainKey
    }
    const buyNowData = await BuyNowData.retrieve(connection, domainKey)

    const price = buyNowData?.maxPrice.toNumber()
      ? buyNowData?.maxPrice.toNumber() / Math.pow(10, 6)
      : undefined
    return price
  }

  const values = {
    getListedDomains,
    getAuctionInfo,
    getActiveAuctionList,
    domainList,
    resellUserDomain,
    bidOnDomain,
    cancelBidOnDomain,
    claimDomain,
    reclaimDomain,
    getActiveAuctionListByName,
    getOwner,
    canCancelBid,
    userHasBids,
    isUserWinner,
    getBuyNowPrice,
  }
  return (
    <DomainListingContext.Provider value={values}>
      {children}
    </DomainListingContext.Provider>
  )
}

export const useDomainListing = () => {
  return useContext(DomainListingContext)
}
