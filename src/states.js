import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  stateBox: {
    boxShadow: '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    height: '100%',
    padding: '10px',
  },
})

export default function States(props) {
  const classes = useStyles()
  const data = props.statesData
  return (
    <div className={classes.stateBox}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        States({props.roleName})
      </Typography>
      <Typography component="p" variant="subtitle2">
        Average: {data.average.toFixed(2)}
      </Typography>
      <Typography component="p" variant="subtitle2">
        Number of voters: {data.totalVote}
      </Typography>
      <Typography component="p" variant="subtitle2">
        Top score : {data.max}
      </Typography>
      <Typography component="p" variant="subtitle2">
        Lowest score : {data.min}
      </Typography>
    </div>
  )
}
