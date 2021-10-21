import React, { useState } from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import MenuIcon from '@material-ui/icons/Menu';
import { AppBar, Box, Button, IconButton, LinearProgress, Toolbar } from '@material-ui/core'
import { useRouter } from 'next/router'
import clsx from 'clsx';

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: 'none',
  },
  progress: {
    margin: '2px',
    marginRight: drawerWidth,
  },
}))

export default function TopBar(props) {
  const classes = useStyles()
  const router = useRouter()

  const handleClick = () => {
    router.reload()
  }

  return (
    <div>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: props.open,
        })}
      >
        <Toolbar>
          <IconButton onClick={handleClick} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <GroupWorkIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Scrum Poker
          </Typography>
          {props.profileName && !props.isError && (
            <div style={{ display: 'flex' }}>
              <Typography variant="subtitle1" color="inherit" noWrap>
                Hi {props.profileName},
              </Typography>
              <Button onClick={handleClick} style={{ padding: 0 }} color="inherit">
                Logout
              </Button>
            </div>
          )}
          <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={props.handleDrawerOpen} className={clsx(props.open && classes.hide)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  )
}
