import React, { useEffect, useState, useMemo } from "react"
import { useWallet } from "../../contexts/wallet"
// import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Countdown from "react-countdown"
import { CircularProgress, Snackbar } from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"

import * as anchor from "@project-serum/anchor"

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

import {
  getCandyMachineState,
  awaitTransactionSignatureConfirmation,
  mintOneToken,
  CandyMachineAccount,
} from "../../candy-machine"

import {
  getCandyMachineStateV1,
  awaitTransactionSignatureConfirmationV1,
  mintOneTokenV1,
  CandyMachineV1,
} from "../../candy-machine-v1"

export interface MintButtonProps {
  candyMachineId: anchor.web3.PublicKey
  config: anchor.web3.PublicKey
  connection: anchor.web3.Connection
  startDate: number
  treasury: anchor.web3.PublicKey
  txTimeout: number
  hideMintButton?: boolean
}

const MintButton = ({
  candyMachineId,
  config,
  connection,
  startDate: mintStart,
  treasury,
  txTimeout,
  hideMintButton,
}: MintButtonProps) => {
  const { wallet } = useWallet()
  const [isSoldOut, setIsSoldOut] = useState(false) // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false) // true when user got to press MINT
  const [itemsRedeemed, setItemsRedeemed] = useState(0)
  const [percentComplete, setPercentComplete] = useState(0)
  const [startDate, setStartDate] = useState(new Date(mintStart * 1000))
  const [isLive, setIsLive] = useState<boolean>()

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  })

  // const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<
    CandyMachineAccount | CandyMachineV1
  >()

  const refreshCandyMachineState = () => {
    ;(async () => {
      if (!wallet || !candyMachineId || !connection) return

      let candyMachineData: CandyMachineAccount | any

      if (candyMachineId === config) {
        candyMachineData = await getCandyMachineState(
          wallet as unknown as anchor.Wallet,
          candyMachineId,
          connection
        )
      } else {
        candyMachineData = await getCandyMachineStateV1(
          wallet as unknown as anchor.Wallet,
          candyMachineId,
          connection
        )
      }

      if (!candyMachineData) return

      if (candyMachineData?.state) {
        const {
          itemsAvailable,
          itemsRemaining,
          itemsRedeemed,
          goLiveDate,
          isActive,
        } = candyMachineData?.state

        setPercentComplete((itemsRedeemed / itemsAvailable) * 100)
        setItemsRedeemed(itemsRedeemed)
        setIsSoldOut(itemsRemaining === 0)
        setStartDate(new Date(goLiveDate.toNumber() * 1000))
        setCandyMachine(candyMachineData)
        setIsLive(isActive)
      } else {
        const {
          candyMachine,
          itemsAvailable,
          itemsRemaining,
          itemsRedeemed,
          goLiveDate,
        } = candyMachineData

        setPercentComplete((itemsRedeemed / itemsAvailable) * 100)
        setItemsRedeemed(itemsRedeemed)
        setIsSoldOut(itemsRemaining === 0)
        setStartDate(goLiveDate)
        setCandyMachine(candyMachine)
        setIsLive(goLiveDate <= new Date())
      }
    })()
  }

  useEffect(refreshCandyMachineState, [wallet, candyMachineId, connection])

  const onMint = async () => {
    try {
      setIsMinting(true)

      if (wallet && candyMachine) {
        let mintTxId: string | undefined
        let status: void | anchor.web3.SignatureStatus | null

        if (candyMachineId === config) {
          mintTxId = await mintOneToken(
            candyMachine as CandyMachineAccount,
            wallet?.publicKey as PublicKey
          )

          if (!mintTxId) return
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            txTimeout,
            connection
          )
        } else {
          mintTxId = await mintOneTokenV1(
            candyMachine as CandyMachineV1,
            config,
            wallet.publicKey!,
            treasury
          )

          if (!mintTxId) return
          status = await awaitTransactionSignatureConfirmationV1(
            mintTxId,
            txTimeout,
            connection
          )
        }

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          })
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          })
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!"
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`
          setIsSoldOut(true)
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      })
    } finally {
      setIsMinting(false)
      refreshCandyMachineState()
    }
  }

  return (
    <div className="w-full">
      {!hideMintButton && (
        <div>
          {isLive ? (
            !wallet || !wallet!.publicKey ? (
              <button className="btn" disabled={true}>
                {" "}
                Connect your Wallet{" "}
              </button>
            ) : (
              <React.Fragment>
                <button
                  id="addToCartButton"
                  className="btn"
                  onClick={onMint}
                  disabled={isSoldOut || isMinting}
                >
                  {isSoldOut ? (
                    "SOLD OUT"
                  ) : isMinting ? (
                    <CircularProgress />
                  ) : (
                    "MINT"
                  )}
                </button>{" "}
              </React.Fragment>
            )
          ) : (
            <button
              id="addToCartButton"
              className="btn"
              onClick={onMint}
              disabled={true}
            >
              <Countdown
                date={startDate}
                onComplete={() => refreshCandyMachineState()}
                renderer={renderCounter}
              />
            </button>
          )}
        </div>
      )}
      {!!wallet && (
        <div className="relative pt-1 mt-5 w-full">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                {isLive && !isSoldOut ? "Mint in Progress" : "Not Active"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-purple-600">
                {itemsRedeemed} MINTED
              </span>
            </div>
          </div>
          <div
            className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200"
            style={{ width: percentComplete + "%" }}
          >
            <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
          </div>
        </div>
      )}

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

interface AlertState {
  open: boolean
  message: string
  severity: "success" | "info" | "warning" | "error" | undefined
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <div>
      {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
    </div>
  )
}

export default MintButton
