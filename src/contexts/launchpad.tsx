import { createContext, useContext, useState } from "react"
import { Props } from "react-select"
import { GET_LAUNCHPAD_PROJECTS } from "../constants/urls"

type LaunchPadContextProps = {
  projects: LaunchPadProject[] | undefined
  getProjects: () => void
}

export type LaunchPadProject = {
  candy_machine_config: string
  candy_machine_id: string
  candy_start_date: number
  description: string
  image: string
  name: string
  order: number
  price: number
  supply: number
  featured: boolean
  treasurey_address: string
  twitter?: string
  discord?: string
  website?: string
  isEndorsed: boolean
}

const LaunchPadContext = createContext<LaunchPadContextProps>({
  projects: undefined,
  getProjects() {},
})

export const LaunchPadContextProvider = ({ children }: Props) => {
  const [projects, setProjects] = useState<LaunchPadProject[]>()

  const getProjects = async () => {
    try {
      const response = await fetch(GET_LAUNCHPAD_PROJECTS, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      const responseJson = await response.json()
      console.log(responseJson)
      setProjects(responseJson?.project_list)
    } catch (err) {
      console.log(err)
    }
  }

  const values = { projects, getProjects }
  return (
    <LaunchPadContext.Provider value={values}>
      {children}
    </LaunchPadContext.Provider>
  )
}

export const useLaunchPad = () => {
  return useContext(LaunchPadContext)
}
