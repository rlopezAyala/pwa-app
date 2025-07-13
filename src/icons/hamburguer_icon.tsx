import { useState } from "react"
import classnames from "classnames"
import style from "./main.module.css"

interface Props {
  onClick: (state: boolean) => void
}

export const HamburguerIcon = (props: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      id="hamburguer_icon"
      className={classnames(style.icon, { [style.open]: open })}
      onClick={() => {
        setOpen(!open)
        props.onClick(!open)
      }}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}
