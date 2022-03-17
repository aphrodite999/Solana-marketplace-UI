import { ReactChild, useEffect } from "react"

interface ModalProps {
  isOpen: boolean
  onCloseClick?: () => void
  children: ReactChild
  className?: string
}

export const Modal = ({
  isOpen,
  onCloseClick,
  children,
  className,
}: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  return isOpen ? (
    <div
      className={
        "z-50 fixed flex inset-0 bg-black bg-opacity-90 overflow-y-auto h-full w-full pl-10 pr-10"
      }
      onClick={(e) => onCloseClick && onCloseClick()}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        style={{ boxShadow: "0px 3px 36px #000000CB" }}
        className={`${className} flex flex-columb m-auto rounded-lg h-auto max-w-2xl bg-gray-800`}
      >
        {children}
      </div>
    </div>
  ) : null
}
