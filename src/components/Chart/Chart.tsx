import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { Datum } from "../../types/models/trade"

interface Props {
  socket: WebSocket
  cardInfo: Datum[]
  chartS: Alert
}

interface Alert {
  value: string
  price: number
}

export default function BiaxialLineChart(props: Props) {
  let pData: number[] = [],
    xLabels: number[] = []

  //Takes from the card info the prices, because for the chart is the only value needed.
  props.cardInfo.map((item) => {
    if (item.s == props.chartS.value) {
      pData.push(item.p)
      xLabels.push(item.t)
    }
  })

  //We slice it to a 29 elements.
  pData = pData.slice(pData.length - 30, pData.length - 1)
  xLabels = xLabels.slice(xLabels.length - 30, xLabels.length - 1)

  return (
    <LineChart
      height={300}
      series={[{ data: pData, label: "Amount", yAxisId: "leftAxisId" }]}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      yAxis={[
        { id: "leftAxisId", width: 50 },
        { id: "rightAxisId", position: "right" }
      ]}
    />
  )
}
