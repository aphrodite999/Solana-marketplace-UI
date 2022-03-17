import {
  CurrencyDollarIcon,
  LockOpenIcon,
  ExclamationIcon,
  TicketIcon,
  GlobeAltIcon,
} from "@heroicons/react/solid"
import {
  SpeakerphoneIcon,
} from "@heroicons/react/outline"
import * as ROUTES from "../../../constants/routes"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { useConnection } from "../../../contexts"
import { LaunchPadProject, useLaunchPad } from "../../../contexts/launchpad"
import { toPublicKey } from "../../../utils"
import MintButton from "../../../views/mint-button"
import { Page } from "../../Page"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { ReactComponent as DiscordLogo } from "../../../assets/logo/discord.svg"
import { ReactComponent as TwitterLogo } from "../../../assets/logo/twitter.svg"
import { IMAGE_KIT_ENDPOINT_URL } from "../../../constants/images";
import MaintenanceBanner from "../../../assets/logo/maintenance.jpeg"

// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
dayjs.extend(utc)

export const LaunchPadHome = () => {
  const { getProjects, projects } = useLaunchPad()
  const [featuredProject, setFeaturedProject] = useState<LaunchPadProject>()
  const connection = useConnection()
  const { push } = useHistory()
  const { projectName } = useParams<{ projectName: string }>()

  useEffect(() => {
    const featProject =
      (projects || []).find((project) => project.name === projectName) ||
      (projects || []).find((project) => project.featured)
    setFeaturedProject(featProject)
  }, [projectName, projects])

  useEffect(() => {
    getProjects()
  }, [])

  const goToProject = (projectName: string) => {
    push(`${ROUTES.LAUNCHPAD}/${projectName}`)
  }

  const txTimeout = 30000
  {/**return (
    <Page>
      <>
        <div className="bg-max-w-7xl mx-auto pt-12 px-4 text-center">
          <h1 className="text-white text-4xl font-bold">
            DigitalEyes Launchpad
          </h1>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col">
            {featuredProject && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-center">
                  <div className="mt-10 lg:mt-0 px-4 lg:col-span-6 align-middle md:max-w-2xl md:mx-auto lg:order-2">
                    <div className="sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                      <img src={featuredProject.image} />
                    </div>
                  </div>
                  <div className="py-16 xl:py-40 px-4 sm:px-6 md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center lg:order-1">
                    <div>
                      {featuredProject.isEndorsed && (
                        <p className="flex align-middle">
                          <LockOpenIcon
                            width="20"
                            color="white"
                            className="mr-1"
                          />
                          <span className="mt-1 text-gray-200">
                            Featured Launch
                          </span>
                        </p>
                      )}
                      <h1 className="mt-4 text-3xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl">
                        {featuredProject.name}
                      </h1>
                      <div className="flex mx-auto">
                        {featuredProject.discord && (
                          <a
                            className="m-3"
                            href={featuredProject.discord}
                            target="_blank"
                          >
                            <DiscordLogo className="h-6 w-6 hover:text-blue-800" />
                          </a>
                        )}
                        {featuredProject.twitter && (
                          <a
                            className="m-3"
                            href={featuredProject.twitter}
                            target="_blank"
                          >
                            <TwitterLogo className="h-6 w-6 hover:text-blue-800" />
                          </a>
                        )}
                        {featuredProject.website && (
                          <a
                            className="m-3"
                            href={featuredProject.website}
                            target="_blank"
                          >
                            <GlobeAltIcon className="h-6 w-6 hover:fill-current hover:text-blue-800" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center mt-4">
                        <div className="pr-2 text-xs">
                          <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            SUPPLY
                          </p>
                          <TicketIcon
                            width="20"
                            color="white"
                            className="ml-4"
                          />
                          <p className="text-base text-white-300 sm:mt-5 sm:text-md lg:text-lg">
                            {featuredProject.supply}
                          </p>
                        </div>
                        <div className="px-2 text-xs">
                          <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            PRICE
                          </p>
                          <CurrencyDollarIcon
                            width="20"
                            color="white"
                            className="ml-3"
                          />
                          <p className="text-base text-white-300 sm:mt-5 sm:text-md lg:text-lg">
                            {featuredProject.price} SOL
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                        {featuredProject.description}
                      </p>

                      <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                        Mint Starting on{" "}
                        {dayjs
                          .utc(dayjs.unix(featuredProject.candy_start_date))
                          .format("DD MMM YYYY")}{" "}
                        at{" "}
                        {dayjs
                          .utc(dayjs.unix(featuredProject.candy_start_date))
                          .format("HH:mm")}{" "}
                        UTC
                      </p>

                      <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                        Your Time:{" "}
                        {dayjs
                          .unix(featuredProject.candy_start_date)
                          .format("DD MMM YYYY")}{" "}
                        at{" "}
                        {dayjs
                          .unix(featuredProject.candy_start_date)
                          .format("HH:mm")}
                      </p>

                      {featuredProject.candy_machine_id && (
                        <div className="flex space-x-2 mt-8 gap-2 text-sm text-white  uppercase tracking-wide font-semibold sm:mt-10">
                          <MintButton
                            candyMachineId={toPublicKey(
                              featuredProject.candy_machine_id
                            )}
                            config={toPublicKey(
                              featuredProject.candy_machine_config
                            )}
                            connection={connection}
                            startDate={featuredProject.candy_start_date}
                            treasury={toPublicKey(
                              featuredProject.treasurey_address
                            )}
                            txTimeout={txTimeout}
                          />
                        </div>
                      )}
                      {!featuredProject.isEndorsed && (
                        <p className="flex align-middle">
                          <span className="mt-1 text-gray-200 text-xs">
                            DigitalEyes only provides this landing page and
                            minting services to facilitate the launch of this
                            collection. We do not endorse or curate these
                            collections, and buyer discretion is advised at all
                            times.
                          </span>
                        </p>
                      )}
                      <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                        <div className="flex flex-wrap items-start justify-between"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {projects
            ?.sort((a, b) => (b?.order || 0) - (a?.order || 0))
            .map((project) => {
              return (
                project.name !== featuredProject?.name && (
                  <div
                    key={project.name}
                    className="flex flex-col w-2/3 mx-auto my-6 p-6 rounded-md md:flex-row hover:bg-gray-600 cursor-pointer"
                    onClick={() => goToProject(project?.name || "featured")}
                  >
                    <div className="flex flex-col w-full">
                      {project.isEndorsed && (
                        <p className="flex align-middle">
                          <LockOpenIcon
                            width="20"
                            color="white"
                            className="mr-1"
                          />
                          <span className="mt-1 text-gray-200">
                            Featured Launch
                          </span>
                        </p>
                      )}
                      <div className="flex flex-col">
                        <h1 className="text-3xl tracking-tight font-extrabold text-white sm:leading-none mt-4">
                          {project.name}
                        </h1>
                        <div className="flex items-center mt-4">
                          <div className="flex pr-2 text-xs">
                            <TicketIcon
                              width="20"
                              color="white"
                              className="ml-4"
                            />
                            <p className="text-base text-white-300 my-auto sm:text-md lg:text-lg">
                              {project.supply}
                            </p>
                          </div>
                          <div className="flex px-2 text-xs">
                            <CurrencyDollarIcon
                              width="20"
                              color="white"
                              className="ml-3"
                            />
                            <p className="text-base text-white-300 my-auto sm:text-md lg:text-lg">
                              {project.price} SOL
                            </p>
                          </div>
                        </div>
                      </div>
                      {project?.candy_machine_id && (
                        <MintButton
                          candyMachineId={toPublicKey(project.candy_machine_id)}
                          config={toPublicKey(project.candy_machine_config)}
                          connection={connection}
                          startDate={project.candy_start_date}
                          treasury={toPublicKey(project.treasurey_address)}
                          txTimeout={txTimeout}
                          hideMintButton={true}
                        />
                      )}
                      <p className="mt-2 text-gray-300 ">
                        {project.description}
                      </p>
                      {!project?.candy_machine_id && (
                        <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                          Mint Starting on{" "}
                          {dayjs
                            .utc(dayjs.unix(project.candy_start_date))
                            .format("DD MMM YYYY")}{" "}
                          at{" "}
                          {dayjs
                            .utc(dayjs.unix(project.candy_start_date))
                            .format("HH:mm")}{" "}
                          UTC
                        </p>
                      )}
                    </div>
                    <img
                      className="m-4 w-auto h-auto rounded-lg md:w-52 md:h-54 md:m-10 md:mr-0"
                      src={project.image}
                    />
                  </div>
                )
              )
            })}
        </div>
      </>
    </Page>
  )**/}
  return (
    <Page title="Launchpad | DigitalEyes">
    <>

            <img
              src={MaintenanceBanner}
              className="z-0 absolute top-0 w-screen object-cover bg-image-gradient opacity-60 h-screen-half"
            />

          <div className= "relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-16 sm:pt-10 z-10">
              <div className="relative text-center">
                <h1 className="h1 text-shadow-bg mt-20"> DigitalEyes Launchpad </h1>
                <div className="flex justify-evenly flex-col w-full text-center">
                  <div className="mt-60 mb-80 text-center">
                    <p className="text-gray-300  capitalize mx-auto w-5/6 text-xl leading-loose text-shadow-bg opacity-80 inline">
                     🚧 🚧 -- Brand new Launchpad experience coming soon -- 🚧 🚧
                    </p>
                    </div>

                </div>
              </div>
            </div>
          </div>
          </>
    </Page>
  )
}
