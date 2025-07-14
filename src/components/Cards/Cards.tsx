import classNames from "classnames"
import Divider from "@mui/material/Divider"
import { Trade } from "../../types/models/trade"
import "./Cards.css"
import { useEffect, useRef, useState } from "react"

interface Props {
  cardInfo: Trade[]
  names: string[]
}

interface CardValue {
  price: number
  direction: string
  percentage: number
}

export default function Cards(props: Props) {
  const [lastPrices, setLastPrices] = useState<Record<string, CardValue>>({})

  /**
   * This funtion compares the new price with the old price and gets the percentage, and the direction to change the color and the arrow
   * @param trades
   */
  function handleTrades(trades: any[]) {
    let newLastPrices = {}

    trades.forEach((trade) => {
      const newPrice = trade.p
      const oldPrice = lastPrices[trade.s] && lastPrices[trade.s].price

      let direction = true
      let percentage = 0
      if (oldPrice !== undefined) {
        percentage = ((newPrice - oldPrice) / oldPrice) * 100
        if (newPrice > oldPrice) {
          direction = true
        } else if (newPrice < oldPrice) {
          direction = false
        }
      }
      newLastPrices = {
        ...newLastPrices,
        [trade.s]: { price: newPrice, direction, percentage }
      }
    })

    setLastPrices({ ...lastPrices, ...newLastPrices })
  }

  const prevCardInfo = useRef(props.cardInfo)
  useEffect(() => {
    if (props.cardInfo != prevCardInfo.current) {
      handleTrades(props.cardInfo)
    }
  }, [props.cardInfo])

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
                <p>{lastPrices && lastPrices[item] && lastPrices[item].price && parseFloat(lastPrices[item].price.toFixed(2))}</p>
              </div>
              <div
                className={classNames({
                  "percentage-red": lastPrices && lastPrices[item] && !lastPrices[item].direction,
                  "percentage-green": lastPrices && lastPrices[item] && lastPrices[item].direction
                })}
              >
                <i
                  className={classNames({
                    "fas fa-chevron-up": lastPrices && lastPrices[item] && lastPrices[item].direction,
                    "fas fa-chevron-down": lastPrices && lastPrices[item] && !lastPrices[item].direction
                  })}
                ></i>
                {lastPrices && lastPrices[item] && parseFloat(lastPrices[item].percentage.toFixed(2))}%
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
