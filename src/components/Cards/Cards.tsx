import classNames from "classnames"
import Divider from "@mui/material/Divider"
import { Trade } from "../../types/models/trade"
import "./Cards.css"
import { useEffect, useRef, useState } from "react"

interface Props {
  cardInfo: Record<string, CardValue>
  names: string[]
}

interface CardValue {
  price: number
  direction: string
  percentage: number
}

export default function Cards(props: Props) {
  return render()

  function render() {
    const { names } = props

    return (
      <div className="cardWrapper">
        {names.map((item, key) => {
          return (
            <div>
              <div className="cardTitleWrapper">
                <p>{item}</p>
                <p>{props.cardInfo && props.cardInfo[item] && props.cardInfo[item].price && parseFloat(props.cardInfo[item].price.toFixed(2))}</p>
              </div>
              <div
                className={classNames({
                  "percentage-red": props.cardInfo && props.cardInfo[item] && !props.cardInfo[item].direction,
                  "percentage-green": props.cardInfo && props.cardInfo[item] && props.cardInfo[item].direction
                })}
              >
                <i
                  className={classNames({
                    "fas fa-chevron-up": props.cardInfo && props.cardInfo[item] && props.cardInfo[item].direction,
                    "fas fa-chevron-down": props.cardInfo && props.cardInfo[item] && !props.cardInfo[item].direction
                  })}
                ></i>
                {props.cardInfo && props.cardInfo[item] ? `${parseFloat(props.cardInfo[item].percentage.toFixed(4))}% ` : "0.0%"}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
