import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { Datum } from "../../types/models/trade"

interface Props {
  cardInfo: Datum[]
  chartS: {
    value: string
    price: number
    type?: "above" | "below" | "any"
  }
}

export default function BiaxialLineChart(props: Props) {
  let pData: number[] = []
  let xLabels: (number | string)[] = []

  // Filter trades for the selected symbol and extract prices
  const filteredTrades = props.cardInfo.filter((item) => item.s === props.chartS.value)

  // Get the last 30 trades
  const recentTrades = filteredTrades.slice(Math.max(0, filteredTrades.length - 30))

  // If no trades yet, show placeholder data
  if (recentTrades.length === 0) {
    // Show placeholder message
    pData = [0]
    xLabels = ["No Data"]
  } else {
    recentTrades.forEach((item) => {
      pData.push(item.p)
      xLabels.push(item.t)
    })
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Show message when no symbol selected or no data */}
      {(!props.chartS.value || recentTrades.length === 0) && (
        <div
          style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "14px",
            width: "100%",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px"
          }}
        >
          {!props.chartS.value ? "📊 Select a stock to see price history" : "⏳ Waiting for price data..."}
        </div>
      )}

      {/* Show chart only when there is data */}
      {props.chartS.value && recentTrades.length > 0 && (
        <LineChart
          width={500}
          height={300}
          series={[{ data: pData, label: `${props.chartS.value} Price`, yAxisId: "leftAxisId" }]}
          xAxis={[{ scaleType: "point", data: xLabels }]}
          yAxis={[
            { id: "leftAxisId", width: 50 },
            { id: "rightAxisId", position: "right" }
          ]}
        />
      )}
    </div>
  )
}
