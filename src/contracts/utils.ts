import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

import Wallet from "@project-serum/sol-wallet-adapter";
import { WalletAdapter } from "../contexts/wallet";

import { idlD } from "./anchor-idl/dutch-auction";


export async function getOrCreateAssociatedAccountInfo(t: Token, clientPubkey: PublicKey) {
  // FIXME need to augment the ambient typedef instead of hard-coding this.
  // https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  const FAILED_TO_FIND_ACCOUNT = "Failed to find account";
  const INVALID_ACCOUNT_OWNER = "Invalid account owner";

  const mint = t.publicKey;

  // This is the optimum logic, considering TX fee, client-side computation,
  // RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically;
  const associatedAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    clientPubkey
  );
  try {
    await t.getAccountInfo(associatedAddress);
    return { address: associatedAddress, createIx: null };
  } catch (err) {
    // INVALID_ACCOUNT_OWNER can be possible if the associatedAddress has
    // already been received some lamports (= became system accounts).
    // Assuming program derived addressing is safe, this is the only case
    // for the INVALID_ACCOUNT_OWNER in this code-path
    // @ts-ignore
    if (err.message === FAILED_TO_FIND_ACCOUNT || err.message === INVALID_ACCOUNT_OWNER) {
      // as this isn't atomic, it's possible others can create associated
      // accounts meanwhile
      try {
        const owner = clientPubkey;
        const payer = clientPubkey;
        const createIx = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          associatedAddress,
          owner,
          payer
        );
        return { address: associatedAddress, createIx: createIx };
      } catch (err) {
        // ignore all errors; for now there is no API compatible way to
        // selectively ignore the expected instruction error if the
        // associated account is existing already.
        console.log("getOrCreateAssociatedAccountInfo: Warning: ", err);
      }
    }
    throw err;
  }
}

export async function loadProgram(
  connection: Connection,
  wallet: WalletAdapter,
  contractId: PublicKey
) {
  const provider = new anchor.Provider(connection, wallet as typeof Wallet, {
    preflightCommitment: "recent",
  });
  const idl = await anchor.Program.fetchIdl(contractId, provider);

  const program = new anchor.Program(idl as anchor.Idl, contractId, provider);
  return program;
}

export async function loadProgramDutch(
  connection: Connection,
  wallet: WalletAdapter,
  contractId: PublicKey
) {
  const provider = new anchor.Provider(connection, wallet as typeof Wallet, {
    preflightCommitment: "recent",
  });
  //const idl = JSON.parse(
  //    fs.readFileSync("./anchor-idl/mainnet_idl.json", "utf8")
  //  );
  const program = new anchor.Program(idlD as anchor.Idl, contractId, provider);
  return program;
}
