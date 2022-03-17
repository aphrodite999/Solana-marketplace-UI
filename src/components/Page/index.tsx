import { ReactChild, useEffect } from "react"
import { useLocation } from "react-router-dom"

interface PageProps {
  className?: string
  title?: string
  children: ReactChild
}

export const Page = ({ className, title, children }: PageProps) => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.title = title || "DigitalEyes Market"
  }, [title])

  return <div className={className}>{children}</div>
}
