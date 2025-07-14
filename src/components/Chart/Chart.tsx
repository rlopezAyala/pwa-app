import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { Datum, Trade } from "../../types/models/trade"

interface Props {
  socket: WebSocket
  cardInfo: Datum[]
  chartS: Alert
}

interface Alert {
  value: string
  price: string
}

export default function BiaxialLineChart(props: Props) {
  let pData: number[] = [],
    xLabels: number[] = []

  props.cardInfo.map((item) => {
    if (item.s == props.chartS.value) {
      pData.push(item.p)
      xLabels.push(item.t)
    }
  })
  debugger
  return (
    <LineChart
      height={300}
      series={[{ data: pData, label: "pv", yAxisId: "leftAxisId" }]}
      xAxis={[{ scaleType: "point", data: xLabels }]}
      yAxis={[
        { id: "leftAxisId", width: 50 },
        { id: "rightAxisId", position: "right" }
      ]}
    />
  )
}
