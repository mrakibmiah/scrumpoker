import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Box, Divider, Drawer } from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import IconButton from '@material-ui/core/IconButton'

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  activityText: {
    fontSize: '12px',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
}))

export default function RightSidebar(props) {
  const classes = useStyles()
  const theme = useTheme()
  const activities = props.activities ? props.activities : []

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={props.open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={props.handleDrawerClose}>{theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
      </div>
      <Typography variant="subtitle1" align="center" color="textSecondary">
        <b>Room Activites</b>
      </Typography>
      <Divider />
      {activities.map((item, index) => (
        <Typography key={index} className={classes.activityText}>
          {item}
        </Typography>
      ))}
    </Drawer>
  )
}
