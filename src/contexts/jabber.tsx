import {
  createProfile,
  createThread,
  encryptMessage,
  Message,
  MessageType,
  Profile,
  retrieveUserThread,
  sendMessage,
  setUserProfile,
  Thread,
} from "@bonfida/jabber"
import { Connection, PublicKey } from "@solana/web3.js"
import { createContext, useContext, useState } from "react"
import { Props } from "react-select"
import { sendTransaction, WalletAdapter } from "."
import { DomainName, getUserDomains } from "../utils/name-service"

type JabberContextInitialStateProps = {
  getProfile: (connection: Connection, publicKey: PublicKey) => void
  getAllThreads: (connection: Connection, publicKey: PublicKey) => void
  updateLocalMessageCount: (recipient: string, publicKey: string) => void
  setUpAccount: (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    name: string,
    bio: string,
    lamportsPerMessage: number
  ) => Promise<string | undefined>
  updateAccount: (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    name: string,
    bio: string,
    lamportsPerMessage: number
  ) => Promise<string | undefined>
  profile: undefined | Profile
  threads: undefined | ThreadWithDomain[]
  messageCount: { name: string; msgCount: number }[] | undefined
  localMessageCount:
    | ({ name: string; msgCount: number } | undefined)[]
    | undefined
  setLocalMessageCount: (
    state: ({ name: string; msgCount: number } | undefined)[]
  ) => void
  sendUserMessage: (
    connection: Connection,
    wallet: WalletAdapter,
    // keyPair: Keypair,
    sender: PublicKey,
    receiver: PublicKey,
    message: Uint8Array,
    kind: MessageType
  ) => Promise<string | undefined>
  getMessages: (
    connection: Connection,
    sender: PublicKey,
    receiver: PublicKey
  ) => Promise<
    | (
        | {
            message: Message
            address: PublicKey
          }
        | undefined
      )[]
    | undefined
  >
  hasThread: (
    connection: Connection,
    sender: PublicKey,
    receiver: PublicKey
  ) => Promise<boolean | undefined>
  startThread: (
    connection: Connection,
    wallet: WalletAdapter,
    sender: PublicKey,
    receiver: PublicKey
  ) => Promise<string | undefined>
}

const JabberContext = createContext<JabberContextInitialStateProps>({
  updateLocalMessageCount() {},
  startThread: () => Promise.resolve({} as string | undefined),
  sendUserMessage: () => {
    return Promise.resolve({} as string | undefined)
  },
  hasThread: () => {
    return Promise.resolve({} as boolean)
  },
  getProfile() {},
  setLocalMessageCount: (
    state: ({ name: string; msgCount: number } | undefined)[]
  ) => {},
  getAllThreads() {},
  profile: undefined,
  setUpAccount: () => Promise.resolve({} as string | undefined),
  updateAccount: () => Promise.resolve({} as string | undefined),
  threads: undefined,
  messageCount: undefined,
  localMessageCount: undefined,
  getMessages: () => {
    return Promise.resolve(
      {} as
        | (
            | {
                message: Message
                address: PublicKey
              }
            | undefined
          )[]
        | undefined
    )
  },
})

export function useJabber() {
  return useContext(JabberContext)
}

export type ThreadWithDomain = Thread & {
  userDomain?: (DomainName | undefined)[]
  messages?:
    | ({ message: Message; address: PublicKey } | undefined)[]
    | undefined
}

export const JabberContextProvider = ({ children }: Props) => {
  const [profile, setProfile] = useState<Profile>()
  const [threads, setThreads] = useState<ThreadWithDomain[]>()
  const [messageCount, setMessageCount] =
    useState<{ name: string; msgCount: number }[]>()
  const [localMessageCount, setLocalMessageCount] = useState<
    ({ name: string; msgCount: number } | undefined)[] | undefined
  >()
  const getProfile = async (connection: Connection, publicKey: PublicKey) => {
    const { retrieve } = Profile
    try {
      const responses = await retrieve(connection, publicKey)
      setProfile(responses)
    } catch (err) {
      console.log(err)
    }
  }

  const setUpAccount = async (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    name: string,
    bio: string,
    lamportsPerMessage: number
  ) => {
    try {
      const instruction = await createProfile(
        publicKey,
        name,
        bio,
        lamportsPerMessage
      )
      if (instruction) {
        const txId = await sendTransaction(
          connection,
          wallet,
          [instruction],
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const updateAccount = async (
    connection: Connection,
    wallet: WalletAdapter,
    publicKey: PublicKey,
    name: string,
    bio: string,
    lamportsPerMessage: number
  ) => {
    try {
      const instruction = await setUserProfile(
        publicKey,
        name,
        bio,
        lamportsPerMessage
      )
      if (instruction) {
        const txId = await sendTransaction(
          connection,
          wallet,
          [instruction],
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getMessages = async (
    connection: Connection,
    sender: PublicKey,
    receiver: PublicKey
  ) => {
    try {
      return await Message.retrieveFromThread(connection, sender, receiver)
    } catch (err) {
      console.log(err)
    }
  }

  const getAllThreads = async (
    connection: Connection,
    publicKey: PublicKey
  ) => {
    try {
      const response = await retrieveUserThread(connection, publicKey)
      const threadsList = (await Promise.all(
        response?.map((data) => Thread.deserialize(data.account.data))
      )) as ThreadWithDomain[]
      await Promise.all(
        threadsList?.map(async (data, idx) => {
          threadsList[idx].userDomain = await getUserDomains(
            connection,
            data.user2.toString() === publicKey.toString()
              ? data.user1
              : data.user2
          )
          threadsList[idx].messages = await getMessages(
            connection,
            data.user1,
            data.user2
          )
        })
      )
      const orderedThreads = threadsList.sort((a, b) => {
        if (a.messages && b.messages) {
          const dateA = parseFloat(
            a?.messages[
              a?.messages?.length - 1
            ]?.message.timestamp.toString() as string
          )
          const dateB = parseFloat(
            b?.messages[
              b?.messages?.length - 1
            ]?.message.timestamp.toString() as string
          )

          return dateB - dateA
        } else {
          return 0
        }
      })

      const messages = orderedThreads.map((thread) => {
        return {
          name:
            thread.user2.toString() === publicKey.toString()
              ? thread.user1.toString()
              : thread.user2.toString(),
          msgCount: thread.msgCount,
        }
      })
      setMessageCount(messages)
      setThreads(orderedThreads)
    } catch (err) {
      console.log(err)
    }
  }

  const updateLocalMessageCount = (recipient: string, publicKey: string) => {
    const updatedLocalMessageObject = messageCount?.map((count) => {
      if (count?.name.toString() === recipient) {
        return count
      } else {
        return localMessageCount?.find(
          (localCount) =>
            localCount?.name?.toString() === count?.name?.toString()
        )
      }
    })
    localStorage.setItem(
      `localMessageObject:${publicKey}`,
      JSON.stringify(updatedLocalMessageObject)
    )
    setLocalMessageCount(updatedLocalMessageObject)
  }

  const sendUserMessage = async (
    connection: Connection,
    wallet: WalletAdapter,
    // keyPair: Keypair,
    sender: PublicKey,
    receiver: PublicKey,
    message: Uint8Array,
    kind: MessageType
  ) => {
    try {
      //for encrypted messages
      // const thread = await Thread.retrieve(connection, receiver, sender);

      // const seeds = Message.generateSeeds(thread.msgCount, receiver, sender);

      // const [messageAccount] = await findProgramAddress(seeds, JABBER_ID);

      // const publicKey = keyPair?.publicKey.toBuffer();
      // const secretKey = Buffer.from(keyPair?.secretKey);

      // const dhKeys = {
      //   publicKey,
      //   secretKey,
      // };

      // const encrypted = encryptMessage(message, dhKeys, receiver, messageAccount.toBuffer());

      const instruction = await sendMessage(
        connection,
        sender,
        receiver,
        message,
        kind
      )
      if (instruction) {
        const txId = await sendTransaction(
          connection,
          wallet,
          [instruction],
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const hasThread = async (
    connection: Connection,
    sender: PublicKey,
    receiver: PublicKey
  ) => {
    try {
      const response = await Thread.retrieve(connection, sender, receiver)
      return Boolean(response)
    } catch (err) {
      console.log(err)
      return false
    }
  }

  const startThread = async (
    connection: Connection,
    wallet: WalletAdapter,
    sender: PublicKey,
    receiver: PublicKey
  ) => {
    try {
      const instruction = await createThread(sender, receiver, sender)
      if (instruction) {
        const txId = await sendTransaction(
          connection,
          wallet,
          [instruction],
          [],
          true
        )
        return txId
      }
    } catch (err) {
      console.log(err)
    }
  }

  const values = {
    getProfile,
    profile,
    setUpAccount,
    getAllThreads,
    threads,
    sendUserMessage,
    getMessages,
    hasThread,
    startThread,
    updateAccount,
    messageCount,
    localMessageCount,
    updateLocalMessageCount,
    setLocalMessageCount,
  }

  return (
    <JabberContext.Provider value={values}>{children}</JabberContext.Provider>
  )
}
