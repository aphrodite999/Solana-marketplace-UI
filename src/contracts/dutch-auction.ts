import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection, LAMPORTS_PER_SOL, GetProgramAccountsConfig } from "@solana/web3.js";
import { WalletAdapter } from "../contexts/wallet";
import { decodeMetadata, getMetadataAccount } from "../actions/metadata";
import { DUTCH_AUCTION_CONTRACT_ID } from "../constants/contract_id";
import { getOrCreateAssociatedAccountInfo, loadProgramDutch as loadProgram } from "./utils";
import { sendTransaction } from "../contexts/connection"

const commitment = "confirmed";

const PREFIX = "dutchauction";

const DUTCH_AUCTION_CONTRACT = new PublicKey(DUTCH_AUCTION_CONTRACT_ID);

const MINIMUM_MAKER_BALANCE = 10000000; // 0.01 SOL

export const fetchActiveDutchAuctionOffers = async (
  connection: Connection,
  wallet?: string,
  mint?: string
) => {
  let filterBytes = "";
  let offset = 8;
  if (wallet) {
    offset = 8;
    filterBytes = wallet;
  } else if (mint) {
    offset = 40;
    filterBytes = mint;
  }
  let config: GetProgramAccountsConfig = {
    encoding: "base64",
    filters: [
      {
        memcmp: {
          offset: offset,
          bytes: filterBytes,
        },
      },
    ],
  };

  const programAccounts = await connection.getProgramAccounts(DUTCH_AUCTION_CONTRACT, config);
  return connection ? programAccounts : [];
};

export async function initDutchAuctionTx(
  connection: Connection,
  clientWallet: WalletAdapter,
  mintStr: string,
  startingPrice: number,
  reservedPrice: number,
  priceStep: number,
  interval: number
) {
  const program = await loadProgram(connection, clientWallet, DUTCH_AUCTION_CONTRACT);
  const client = clientWallet.publicKey as PublicKey;
  const mint = new PublicKey(mintStr);
  const clientTokenAccountInfo = await connection.getParsedTokenAccountsByOwner(
    client,
    { mint },
    commitment
  );
  if (clientTokenAccountInfo.value.length < 1) {
    throw new Error("Wallet doesn't have an account for the mint.");
  }

  // Sometimes a token ends up with multiple spl-token accounts,
  // so we'll have to see which one has the token, if any.
  let clientTokenAccount = null;
  for (var i = 0; i < clientTokenAccountInfo.value.length; i++) {
    const clientTokenAccountTokenAmount =
      clientTokenAccountInfo.value[i].account.data.parsed.info.tokenAmount.uiAmount;
    console.log("account/tokenAmount:", i, clientTokenAccountTokenAmount);
    if (clientTokenAccountTokenAmount < 1) {
      continue;
    }
    clientTokenAccount = clientTokenAccountInfo.value[i];
  }
  if (clientTokenAccount === null) {
    throw new Error("Wallet doesn't contain the token");
  }

  const token = clientTokenAccount.pubkey;

  const [transferAuthority, bumpAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    program.programId
  );

  const [saleInfo, bumpInfo] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX), client.toBuffer(), mint.toBuffer()],
    program.programId
  );

  await program.rpc.initAuction(
    new anchor.BN(startingPrice * LAMPORTS_PER_SOL),
    new anchor.BN(reservedPrice * LAMPORTS_PER_SOL),
    new anchor.BN(priceStep * LAMPORTS_PER_SOL),
    new anchor.BN(interval),
    bumpInfo,
    {
      accounts: {
        initializer: client,
        tokenAccount: token,
        mintAccount: mint,
        tokenAuthority: transferAuthority,
        auctionAccount: saleInfo,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
}

export async function cancelDutchAuctionTx(
  connection: Connection,
  clientWallet: WalletAdapter,
  mintStr: string
) {
  const program = await loadProgram(connection, clientWallet, DUTCH_AUCTION_CONTRACT);
  const client = clientWallet.publicKey as PublicKey;
  const mint = new PublicKey(mintStr);
  const clientTokenAccountInfo = await connection.getParsedTokenAccountsByOwner(
    client,
    { mint },
    commitment
  );
  if (clientTokenAccountInfo.value.length < 1) {
    throw new Error("Wallet doesn't have an account for the mint.");
  }

  // Sometimes a token ends up with multiple spl-token accounts,
  // so we'll have to see which one has the token, if any.
  let clientTokenAccount = null;
  for (var i = 0; i < clientTokenAccountInfo.value.length; i++) {
    const clientTokenAccountTokenAmount =
      clientTokenAccountInfo.value[i].account.data.parsed.info.tokenAmount.uiAmount;
    console.log("account/tokenAmount:", i, clientTokenAccountTokenAmount);
    if (clientTokenAccountTokenAmount < 1) {
      continue;
    }
    clientTokenAccount = clientTokenAccountInfo.value[i];
  }
  if (clientTokenAccount === null) {
    throw new Error("Wallet doesn't contain the token");
  }

  const token = clientTokenAccount.pubkey;

  const [transferAuthority, bumpAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    program.programId
  );

  const [saleInfo, _bumpInfo] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX), client.toBuffer(), mint.toBuffer()],
    program.programId
  );

  await program.rpc.cancelAuction({
    accounts: {
      initializer: client,
      tokenAccount: token,
      mintAccount: mint,
      auctionAccount: saleInfo,
      tokenAuthority: transferAuthority,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}

export async function buyAuctionTx(
  connection: Connection,
  clientWallet: WalletAdapter,
  saleInfoStr: string,
  taxRecipient: string,
  taxAmount: string,
  uiExpectedAmount: number
) {

  const program = await loadProgram(connection, clientWallet, DUTCH_AUCTION_CONTRACT);
  let saleInfoAccount;
  try {
    saleInfoAccount = await program.account.auctionAccount.fetch(new PublicKey(saleInfoStr));
    console.log(saleInfoAccount);

  } catch (err) {
    throw new Error("Offer expired");
  }
  const uiExpectedAmountLamports = Math.round(uiExpectedAmount * LAMPORTS_PER_SOL);

  const currentTs = Math.floor(Date.now() / 1000);
  let amountLamports =
    saleInfoAccount.startingPrice.toNumber() -
    Math.floor(
      ((currentTs - saleInfoAccount.startingTs.toNumber()) / saleInfoAccount.interval.toNumber()) *
        saleInfoAccount.priceStep.toNumber()
    );

  if (amountLamports < saleInfoAccount.reservedPrice.toNumber()) {
    amountLamports = saleInfoAccount.reservedPrice.toNumber();
  }

  if (amountLamports > uiExpectedAmountLamports) {
    throw new Error(
      "Expected amount mismatch. Account: " + amountLamports + " / UI: " + uiExpectedAmountLamports
    );
  }
  const walletAccount = await connection.getAccountInfo(clientWallet.publicKey!, commitment);
  if (walletAccount === null) {
    throw new Error("Unfunded wallet account! Add some funds first.");
  }
  const walletBalance = walletAccount.lamports;
  console.log("WB", walletBalance);
  let minimumTakerBalance = MINIMUM_MAKER_BALANCE;
  if (saleInfoAccount.initializerPubkey.toString() !== clientWallet.publicKey!.toString()) {

    minimumTakerBalance += uiExpectedAmount * (1 + parseFloat(taxAmount));
    console.log(minimumTakerBalance);

  }
  console.log("MTB", minimumTakerBalance);
  if (walletBalance < minimumTakerBalance) {
    throw new Error("Wallet SOL balance is likely too low to pay for transaction.");
  }

  const mint = saleInfoAccount.mintPubkey;
  console.log("mint", mint);
  const mintacc: any = await connection.getParsedAccountInfo(mint, commitment);
  console.log("mintacc", mintacc);
  const metadataAccount = await getMetadataAccount(mint);
  console.log("metadataacc", metadataAccount);
  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);
  let creators: any = [];
  const metadata = decodeMetadata(metadataAccountInfo!.data);
  console.log("metadata", metadata);
  metadata.data.creators?.forEach((creator) => {
    creators.push({ pubkey: creator.address, isSigner: false, isWritable: true });
  });

  // check if seller has the token
  const sellerTokenAccountInfo = await connection.getParsedTokenAccountsByOwner(
    saleInfoAccount.initializerPubkey,
    { mint },
    commitment
  );
  if (sellerTokenAccountInfo.value.length < 1) {
    throw new Error("Seller doesn't have an account for the mint.");
  }

  // Sometimes a token ends up with multiple spl-token accounts,
  // so we'll have to see which one has the token, if any.
  let sellerTokenAccount = null;
  for (var i = 0; i < sellerTokenAccountInfo.value.length; i++) {
    const sellerTokenAccountTokenAmount =
      sellerTokenAccountInfo.value[i].account.data.parsed.info.tokenAmount.uiAmount;
    console.log("account/tokenAmount:", i, sellerTokenAccountTokenAmount);
    if (sellerTokenAccountTokenAmount < 1) {
      continue;
    }
    sellerTokenAccount = sellerTokenAccountInfo.value[i];
  }
  if (sellerTokenAccount === null) {
    throw new Error("Seller doesn't have the token");
  }

  const token = sellerTokenAccount.pubkey;

  // create receive token
  const decimals = mintacc.value.data.parsed.info.decimals;

  const splToken = new Token(connection, mint, TOKEN_PROGRAM_ID, clientWallet.publicKey! as any);
  const tokenReceiveAccount = await getOrCreateAssociatedAccountInfo(
    splToken,
    clientWallet.publicKey!
  );


  let instructions = []
  if (tokenReceiveAccount.createIx) {
      instructions.push(tokenReceiveAccount.createIx)
  }

  const [transferAuthority, _bumpAuthority] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    program.programId
  );


  //@ts-ignore
  let buyIx = await program.instruction.buy(new anchor.BN(uiExpectedAmountLamports),{
    accounts: {
      taker: clientWallet.publicKey,
      takerTokenAccount: tokenReceiveAccount.address,
      initializer: saleInfoAccount.initializerPubkey,
      initializerTokenAccount: token,
      mintAccount: mint,
      auctionAccount: new PublicKey(saleInfoStr),
      salesTaxRecipient: new PublicKey(taxRecipient),
      tokenAuthority: transferAuthority,
      metadataAccount: metadataAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    },
    remainingAccounts: creators,
    signers: [],
  });

  instructions.push(buyIx)

  if (instructions.length > 0) {
    const txId = await sendTransaction(
        connection,
        clientWallet,
        instructions,
        [],
        true
      )
      console.log("tx: " + txId)
  }
}
