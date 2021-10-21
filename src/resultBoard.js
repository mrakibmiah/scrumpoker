import { Container, Grid } from '@material-ui/core'
import * as React from 'react'
import States from './states'
import dynamic from 'next/dynamic'

const Graph = dynamic(() => import('./graph').then((mod) => mod.default), { ssr: false })

const ResultBoard = (props) => {
  const { cards } = props
  let chartDataDevelopers = []
  let chartDataTesters = []

  let totalVoteDevelopers = 0
  let totalVoteTesters = 0

  let TotalEstimationDevelopers = 0
  let TotalEstimationTesters = 0

  Object.keys(cards).map((card, index) => {
    if (cards[card].role === 'developer') {
      if (cards[card].voted) {
        totalVoteDevelopers++
        TotalEstimationDevelopers += parseInt(cards[card].value)
      }
      const val = isNaN(parseInt(cards[card].value)) ? 0 : parseInt(cards[card].value)
      chartDataDevelopers.push({ memberName: cards[card].name, voteValue: val })
    } else if (cards[card].role === 'tester') {
      if (cards[card].voted) {
        totalVoteTesters++
        TotalEstimationTesters += parseInt(cards[card].value)
      }
      const val = isNaN(parseInt(cards[card].value)) ? 0 : parseInt(cards[card].value)
      chartDataTesters.push({ memberName: cards[card].name, voteValue: val })
    }
  })
  const averageDevelopers = TotalEstimationDevelopers / totalVoteDevelopers
  const averageTesters = TotalEstimationTesters / totalVoteTesters
  const statesDataDevelopers = {
    average: averageDevelopers,
    totalVote: totalVoteDevelopers,
    max: Math.max(...chartDataDevelopers.map((o) => o.voteValue)),
    min: Math.min(...chartDataDevelopers.map((o) => o.voteValue)),
  }

  const statesTesters = {
    average: averageTesters,
    totalVote: totalVoteTesters,
    max: Math.max(...chartDataTesters.map((o) => o.voteValue)),
    min: Math.min(...chartDataTesters.map((o) => o.voteValue)),
  }

  if (!totalVoteDevelopers && !totalVoteTesters) return 'did not find any estimation'

  return (
    <Container maxWidth="lg">
      <Grid container spacing={1}>
        {totalVoteDevelopers && (
          <Grid item lg={!!totalVoteTesters ? 7 : 12}>
            <Grid container>
              <Grid item xs={12}>
                <Graph roleName={'Developers'} chartData={chartDataDevelopers} />
              </Grid>
            </Grid>
          </Grid>
        )}
        {!!totalVoteTesters && (
          <Grid item lg={!!totalVoteDevelopers ? 5 : 12}>
            <Grid container>
              <Grid item xs={12}>
                <Graph roleName={'Testers'} chartData={chartDataTesters} />
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={1}>
        {!!totalVoteDevelopers && (
          <Grid item>
            <States roleName="Developers" statesData={statesDataDevelopers} />
          </Grid>
        )}
        {!!totalVoteTesters && (
          <Grid item>
            <States roleName="Testers" statesData={statesTesters} />
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

export default ResultBoard
