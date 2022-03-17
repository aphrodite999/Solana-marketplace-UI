import { XCircleIcon } from "@heroicons/react/outline"
// @ts-ignore
import { IKImage } from "imagekitio-react"
import { Link, useHistory, useLocation, useParams } from "react-router-dom"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Divider } from "antd"
import * as ROUTES from "../../constants/routes"
import dayjs from "dayjs"
import React, { useCallback, useEffect, useState, useRef } from "react"
import { shortenAddress } from "../../candy-machine"
import { GET_FOLLOWERS, GET_FOLLOWING } from "../../constants/urls"
import { useConnection } from "../../contexts/connection"
import { SaleData } from "../../types"
import { kFormatter, toPublicKey } from "../../utils"
import { getDomainList } from "../../utils/getDomainList"
import { getUserDomains } from "../../utils/name-service"
import {
  getImagePath,
  IMAGE_KIT_ENDPOINT_URL,
  isImageInCache,
} from "../../constants/images"
import { LoadingWidget } from "../loadingWidget"
import { ActiveArtist } from "../../types"
import { ModalUserActions } from "../../components/ModalUserActions"

interface UserListModalProps {
  isModalOpen?: boolean
  modalType: string
  onCloseClick: () => void
  profile: string | undefined
}
export interface UsersRetrievalResponse {
  cursor: string
  followers: ActiveArtist[]
  following: ActiveArtist[]
  count: number
}

export const UserListModal = ({
  isModalOpen,
  modalType,
  onCloseClick,
  profile,
}: UserListModalProps) => {
  const [listLength, setListLength] = useState(0)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const connection = useConnection()
  const [activeUsers, setActiveUsers] = useState<ActiveArtist[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>("0")
  const [userRetrievalResponseCount, setUserRetrievalResponseCount] =
    useState<number>()
  const [error, setError] = useState(false)

  useEffect(() => {
    loadUsers({ isInitialLoad: true }, profile)
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen])

  const handleScroll = async (e: any) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight
    if (bottom && !isLoadingUsers) {
      loadUsers({ isInitialLoad: false }, profile)
    }
  }

  const closeAndReset = () => {
    onCloseClick()
  }

  useEffect(() => {
    loadUsersController.current = new AbortController()
    return () => {
      loadUsersController.current?.abort()
    }
  }, [])

  let loadUsersController = useRef<AbortController>()

  const loadUsers = useCallback(
    async ({ isInitialLoad = false }: { isInitialLoad?: boolean }, profile) => {
      if (!!nextCursor || isInitialLoad) {
        if (isInitialLoad) {
          setActiveUsers([])
        }
        setIsLoadingUsers(true)
        const apiUrl = `${
          modalType === "followers" ? GET_FOLLOWERS : GET_FOLLOWING
        }/${encodeURIComponent(profile)}/${nextCursor}`

        try {
          const signal = loadUsersController.current?.signal
          const response = await fetch(apiUrl, { signal })
          const responseJson: UsersRetrievalResponse = await response.json()
          await parseUsersRetrievalResponse(responseJson, isInitialLoad)
        } catch (e) {
          setActiveUsers([])
          setUserRetrievalResponseCount(0)
          setError(true)
          console.error(e, `Could not fetch users`)
        }
        setIsLoadingUsers(false)
      }
    },
    [nextCursor, activeUsers, isLoadingUsers]
  )
  const parseUsersRetrievalResponse = async (
    response: UsersRetrievalResponse,
    isInitialLoad: boolean
  ) => {
    setNextCursor(response.cursor)
    if (isInitialLoad) {
      setUserRetrievalResponseCount(response.count)
    }
    if (response?.followers?.length > 0) {
      const users = (
        await Promise.all(
          response?.followers.map(async (user: any) => {
            if (!!user) {
              return {
                banner: user.banner,
                created_at: user.created_at,
                description: user.description,
                discord: user.discord,
                image: user.image,
                instagram: user.instagram,
                mints_list: user.mints_list,
                theme: user.theme,
                twitter: user.twitter,
                updated_at: user.updated_at,
                user_id: user.user_id,
                username: user.username,
                verified: user.verified,
                wallet_key: user.wallet_key,
                website: user.website,
              } as ActiveArtist
            }
            return false
          })
        )
      ).filter(Boolean) as ActiveArtist[]
      console.log(users)

      if (!isInitialLoad) {
        setActiveUsers([...activeUsers, ...users])
        setIsLoadingUsers(false)
      } else {
        setActiveUsers(users)
        setIsLoadingUsers(false)
      }
    } else if (response?.following?.length > 0) {
      const users = (
        await Promise.all(
          response?.following.map(async (user: any) => {
            if (!!user) {
              return {
                banner: user.banner,
                created_at: user.created_at,
                description: user.description,
                discord: user.discord,
                image: user.image,
                instagram: user.instagram,
                mints_list: user.mints_list,
                theme: user.theme,
                twitter: user.twitter,
                updated_at: user.updated_at,
                user_id: user.user_id,
                username: user.username,
                verified: user.verified,
                wallet_key: user.wallet_key,
                website: user.website,
              } as ActiveArtist
            }
            return false
          })
        )
      ).filter(Boolean) as ActiveArtist[]
      console.log(users)

      if (!isInitialLoad) {
        setActiveUsers([...activeUsers, ...users])
        setIsLoadingUsers(false)
      } else {
        setActiveUsers(users)
        setIsLoadingUsers(false)
      }
    } else {
      setActiveUsers([])
      setIsLoadingUsers(false)
    }
  }

  return (
    <>
      <div
        onClick={closeAndReset}
        className="fixed w-full h-full bg-gray-900 opacity-70 left-0 top-0 z-50 cursor-pointer"
      />
      <div className="fixed w-full md:w-1/3  max-w-4xl transform rounded-md shadow -translate-x-1/2 -translate-y-1/2 h-3/4 max-h-full top-1/2 left-1/2 z-50 flex-grow overflow-hidden">
        <div className="bg-gray-800 shadow-lg">
          <div className="grid grid-cols-2 px-4 py-5">
            <p className="justify-self-start uppercase font-light">
              {modalType}
            </p>{" "}
            <button onClick={closeAndReset} className="justify-self-end">
              <span className="flex items-center text-xxs">
                <XCircleIcon className="text-white h-6 w-6 mr-1 focus:outline-none" />
              </span>
            </button>
          </div>
          <Divider />
        </div>
        <div
          onScroll={handleScroll}
          className="flex flex-col h-full p-5 bg-gray-800 pb-16 overflow-y-auto"
        >
          {isLoadingUsers ? (
            <div className="flex-1 justify-center pt-20">
              <div className="w-36 h-36 mx-auto">
                <LoadingWidget />
              </div>
            </div>
          ) : activeUsers.length > 0 ? (
            activeUsers.map((user: ActiveArtist) => (
              <ModalUserActions user={user} onClose={closeAndReset} />
            ))
          ) : (
            <div className="text-center pt-20">
              <span className="text-sm opacity-80">Nothing to Display</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
