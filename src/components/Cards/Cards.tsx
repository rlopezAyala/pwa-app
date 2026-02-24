import classNames from "classnames"
import { CardValue } from "../../types/models/trade"
import "./Cards.css"

interface Props {
  cardInfo: Record<string, CardValue>
  names: string[]
  alertPrice?: number
}

/**
 * Top Cards Component - Displays stock name, current price, and change percentage
 * Colors: Red if price is below alert, Green if price is above alert
 * Shows up/down chevron based on price direction (increase/decrease)
 */
export default function Cards(props: Props) {
  return render()

  function render() {
    const { names, alertPrice } = props

    return (
      <div className="cardWrapper">
        {names.map((item) => {
          const cardData = props.cardInfo?.[item]
          const price = cardData?.price
          const direction = cardData?.direction
          const percentage = cardData?.percentage

          // Determine card color: Red if below alert price, Green if above
          const isBelowAlert = alertPrice !== undefined && price !== undefined && price < alertPrice
          const isAboveAlert = alertPrice !== undefined && price !== undefined && price >= alertPrice

          return (
            <div key={item}>
              <div className="cardTitleWrapper">
                <p>{item}</p>
                <p
                  className={classNames({
                    "price-red": isBelowAlert,
                    "price-green": isAboveAlert
                  })}
                >
                  ${price ? parseFloat(price.toFixed(2)) : "N/A"}
                </p>
              </div>
              <div
                className={classNames({
                  "percentage-red": isBelowAlert,
                  "percentage-green": isAboveAlert,
                  "percentage-neutral": alertPrice === undefined || price === undefined
                })}
              >
                <i
                  className={classNames({
                    "fas fa-chevron-up": direction !== undefined && direction,
                    "fas fa-chevron-down": direction !== undefined && !direction
                  })}
                ></i>
                {percentage !== undefined ? `${parseFloat(percentage.toFixed(4))}% ` : "0.0%"}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
