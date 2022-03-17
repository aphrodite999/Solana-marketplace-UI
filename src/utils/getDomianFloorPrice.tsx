import { AuctionData } from "@bonfida/name-auctioning"
import BN from "bn.js"

export const getDomainFloorPrice = (auctionData: AuctionData) => {
  return (
    new BN(
      auctionData?.priceFloor.hash.toBytes().slice(0, 8) as Uint8Array,
      "le"
    ).toNumber() / Math.pow(10, 6)
  )
}
