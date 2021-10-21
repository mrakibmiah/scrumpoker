import * as React from 'react'
import Paper from '@material-ui/core/Paper'
import { Chart, BarSeries, Title, ArgumentAxis, ValueAxis } from '@devexpress/dx-react-chart-material-ui'

import { Animation, EventTracker } from '@devexpress/dx-react-chart'

const Graph = (props) => {
  const { chartData, roleName } = props
  const roleNameText = `${roleName}`
console.log(chartData)
  return (
    <Paper>
      <Chart data={chartData}>
        <ArgumentAxis />
        <ValueAxis/>

        <BarSeries valueField="voteValue" argumentField="memberName" />
        <Title text={roleNameText} />
        <EventTracker />
        <Animation />
      </Chart>
    </Paper>
  )
}

export default Graph
