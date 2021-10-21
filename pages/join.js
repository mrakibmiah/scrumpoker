import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { Box, Divider, Drawer, LinearProgress, TextField, Typography } from '@material-ui/core'
import JoinForm from '../src/joinForm'
import { useRouter } from 'next/router'
import TopBar from '../src/TopBar'
import Members from '../src/Members'
import Footer from '../src/Footer'
import RightSidebar from '../src/RightSidebar'
import { io } from 'socket.io-client'
import clsx from 'clsx'
import Alert from '@material-ui/lab/Alert'

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  root: {
    display: 'flex',
  },
  cardGrid: {
    paddingBottom: theme.spacing(8),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  activityText: {
    fontSize: '12px',
  },
  voteBtn: {
    margin: '7px',
  },
  title: {
    flexGrow: 1,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
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

let socket
export default function Dashboard(props) {
  const classes = useStyles()
  const [cards, setCards] = useState({})
  const [name, setName] = useState('')
  const [estimate, setEstimate] = useState('')
  const [isEstimateEnabled, setisEstimateEnabled] = useState(false)
  const [isViewResult, setIsViewResult] = useState(false)
  const [joinBtnEnabled, setJoinBtnEnabled] = useState(false)
  const [estimationBtnEnabled, setEstimationBtnEnabled] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [profileName, setProfileName] = useState('')
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [activities, setActivities] = useState([])
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('developer')

  function notifyMe(msg) {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification')
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      var notification = new Notification(msg)
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
          var notification = new Notification(msg)
        }
      })
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  const processResponse = (data) => {
    if (data.hostLeft) {
      router.reload()
      return
    }
    setActivities(data.activities)
    setCards(data.members)
    setisEstimateEnabled(data.roomData.estimationEnabled)
    setIsViewResult(data.roomData.viewResult)
    if (data.roomData.reset) setProgress(0)

    if (data.roomData.estimationEnabled) {
      let voted = 0
      Object.keys(data.members).map((card) => {
        //console.log(data.members[card])
        if (data.members[card].voted) {
          voted++
        }
      })

      if (voted) {
        const p = Object.keys(data.members).length
        const calculateP = (voted / p) * 100
        //console.log(calculateP, voted, p)
        setProgress(calculateP)
      }
    }

    setError(false)
  }

  useEffect(() => {
    console.log('Join page')
    Notification.requestPermission()
    const pushServiceApiPath = '/api/push-service'
    //const pushUrl = 'wss://scrum-poker-service-nodejs-playground.sebshift.dev.sebank.se'
    //const heroku = 'https://scrumpoker-service.herokuapp.com'
    //const pushUrl = 'http://localhost:3002'
    socket = io(process.env.BASE_URL, {
      path: pushServiceApiPath,
    });

    socket.on('connect', function (data) {
      console.log('Client Connected', socket.id)
      setError(false)
    })

    socket.on('joinNewMember', function (data) {
      console.log('joinNewMember', data)
      processResponse(data)
    })

    socket.on('startEstimation', (data) => {
      console.log('startEstimation from server', data)
      notifyMe(`Hey!! ${data.roomInfo.name} requests you to submit your estimation`)
      processResponse(data)
    })

    socket.on('estimationSubmitted', (data) => {
      console.log('estimationSubmitted data', data)
      processResponse(data)
    })

    socket.on('resetTriggered', (data) => {
      console.log('resetTriggered data', data)
      processResponse(data)
      setProgress(0)
    })

    socket.on('resultPublished', (data) => {
      console.log('resultPublished data', data)
      processResponse(data)
    })

    socket.on('memberLeft', (data) => {
      console.log('memberLeft data', data)
      processResponse(data)
    })

    socket.on('hostLeft', (data) => {
      console.log('memberLeft data', data)
      processResponse(data)
    })

    socket.on('errorMember', (msg) => {
      setError(true)
      setErrorMsg(msg)
    })
    socket.on('error', (msg) => {
      setError(true)
      setErrorMsg('Error!! Your connection has been closed, please refresh to join again')
    })

    socket.on('disconnect', () => {
      setError(true)
      setErrorMsg('disconnect!! Your connection has been closed, please refresh to join again')
    })

    return () => socket.disconnect()
  }, [])
  //sss
  const joinHandler = () => {
    const msg = {
      name: name,
      roomId: router.query.id,
      role: role,
    }
    //console.log(msg)
    socket.emit('join', msg)
    setProfileName(name)
  }

  const onChangeValue = (e) => {
    if (e.target.value.length > 3) {
      setJoinBtnEnabled(true)
    } else {
      setJoinBtnEnabled(false)
    }
    setName(e.target.value)
  }

  const handleChangeRole = (event) => {
    setRole(event.target.value)
  }

  const onChangeEstimationValue = (e) => {
    if (e.target.value.length < 3 && e.target.value >= 0) {
      setEstimate(e.target.value)
      setEstimationBtnEnabled(true)
    }
  }
  const submitVote = () => {
    const msg = {
      type: 'vote',
      value: estimate,
      name: name,
      roomId: router.query.id,
    }

    socket.emit('submitEstimation', msg)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const LinearProgressWithLabel = (props) => {
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar
        handleDrawerOpen={handleDrawerOpen}
        isError={error}
        estimationEnabled={isEstimateEnabled}
        progress={progress}
        cards={cards}
        profileName={profileName}
        open={open}
      />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {isEstimateEnabled && Object.keys(cards).length > 0 && (
          <div style={{ marginBottom: '5px' }} className={classes.progress}>
            <LinearProgressWithLabel value={progress} />
          </div>
        )}
        {Object.keys(cards).length < 1 && (
          <div>
            {error && <Alert severity="error">{errorMsg}</Alert>}
            <JoinForm
              handleChangeRole={handleChangeRole}
              role={role}
              joinBtnEnabled={joinBtnEnabled}
              joinHandler={joinHandler}
              onChangeValue={onChangeValue}
            />
          </div>
        )}
        {Object.keys(cards).length > 0 && (
          <Container className={classes.cardGrid} maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Members isEstimateEnabled={isEstimateEnabled} isViewResult={isViewResult} cards={cards} />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  {isEstimateEnabled && (
                    <Grid item xs={12}>
                      <TextField
                        inputProps={{ maxLength: 2 }}
                        type="number"
                        label="Estimation"
                        variant="outlined"
                        onChange={onChangeEstimationValue}
                        value={estimate}
                      />
                      <Button
                        className={classes.voteBtn}
                        size="large"
                        onClick={submitVote}
                        variant="outlined"
                        color="primary"
                        disabled={!estimationBtnEnabled}
                      >
                        Send
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        )}
        <Footer />
      </main>
      <RightSidebar open={open} handleDrawerClose={handleDrawerClose} activities={activities} />
    </div>
  )
}
