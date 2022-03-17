import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useContext } from "react";
import { useNativeAccount } from "../../contexts/accounts";
import SoloProfileContext from "../../contexts/solo-profile";
import { useWallet } from "../../contexts/wallet";
import { getDomainList } from "../../utils/getDomainList";
import { formatNumber, shortenAddress } from "../../utils/utils";

export const CurrentUserBadge = (props: {}) => {
  const { wallet } = useWallet();
  const { account } = useNativeAccount();
  const { profileTheme, isProfilePage } = useContext(SoloProfileContext);

  if (!wallet?.publicKey) {
    return null;
  }

  // should use SOL ◎ ?

  return (
    /**<div
      className="font-medium space-x-2 text-white"
      style={{ color: isProfilePage && profileTheme ? profileTheme.headerForeground : "" }}
    >
      <span>{formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL)} ◎</span>
      <span className="wallet-key">
        {wallet?.domainNames
          ? getDomainList(wallet?.domainNames)
          : shortenAddress(`${wallet.publicKey}`)}
      </span>
    </div>*/
    <div
      style={{ color: isProfilePage && profileTheme ? profileTheme.headerForeground : "" }}
      >
      <div className="text-center mt-2">
      <span className="text-xs opacity-80">
        {wallet?.domainNames
          ? getDomainList(wallet?.domainNames)
          : shortenAddress(`${wallet.publicKey}`)}
      </span>
      </div>
      <div className="text-center mt-2">
      <span className="text-xl">{formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL)} ◎ </span>
      </div>
    </div>

  );
};
