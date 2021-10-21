import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { Box, LinearProgress, Snackbar, Tooltip, Typography } from '@material-ui/core'
import TopBar from '../src/TopBar'
import Members from '../src/Members'
import Footer from '../src/Footer'
import CreateRoom from '../src/createRoom'
import RightSidebar from '../src/RightSidebar'
import Link from 'next/link'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useRouter } from 'next/router'
import { io } from 'socket.io-client'
import dynamic from 'next/dynamic'
import States from '../src/states'
import clsx from 'clsx'
import Alert from '@material-ui/lab/Alert'; // test

const ENDPOINT = 'http://localhost:3005'
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
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  voteBtn: {
    margin: '7px',
  },
  menuButton: {
    marginRight: theme.spacing(2),
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
let hostname

export default function Dashboard(props) {
  const classes = useStyles()
  const [cards, setCards] = useState({})
  const [name, setName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [progress, setProgress] = useState(0)
  const [isEstimationStarted, setisEstimationStarted] = useState(false)
  const [isViewResult, setIsViewResult] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [open, setOpen] = useState(false)
  const [openD, setOpenD] = useState(false)
  const [roomBtnDisabled, setRoomBtnDisabled] = useState(true)
  const [profileName, setProfileName] = useState('')
  const [activities, setActivities] = useState([])
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // window.onbeforeunload = function (e) {
    //   e.preventDefault();
    //   e.returnValue = '';

    //   return '';
    // };
    console.log('useeffect socket')
    const pushUrl = 'wss://scrum-poker-service-nodejs-playground.sebshift.dev.sebank.se'
    const pushServiceApiPath = '/api/push-service'
    //const heroku = 'https://scrumpoker-service.herokuapp.com'
    //const pushUrl = 'http://localhost:3002'
    // socket = io(pushUrl, {
    //   transports:['websocket', 'polling']
    // })

    socket = io(process.env.BASE_URL, {
      path: pushServiceApiPath,
    });

    const processResponse = (data) => {
      setCards(data.members)
      setActivities(data.activities)

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
    }

    socket.on('roomCreated', (data) => {
      console.log('Data from server: roomCreated', data)
      setActivities(data.activities)
      setShowDashboard(true)
      setRoomId(data.socketId)
    })

    socket.on('joinNewMember', (data) => {
      console.log('joinNewMember from server: joinNewMember', data)
      processResponse(data)
    })

    socket.on('resetTriggered', (data) => {
      console.log('resetTriggered data', data)
      processResponse(data)
    })

    socket.on('estimationSubmitted', (data) => {
      console.log('estimationSubmitted data', data)
      processResponse(data)
    })

    socket.on('memberLeft', (data) => {
      console.log('memberLeft data', data)
      processResponse(data)
    })

    socket.on('error', () => {
      setError(true)
      setErrorMsg('Error!! Your connection has been closed, please refresh to join again')
    })

    socket.on('connect', function (data) {
      console.log('Client Connected', socket.id)
      setError(false)
    })

    socket.on('disconnect', () => {
      setError(true)
      setErrorMsg('disconnect!! Your connection has been closed, please refresh to join again')
    })

    setInviteUrl(`${window.location.hostname}/join?id`)
    hostname = window.location.host

    return () => socket.disconnect()
  }, [])

  const createHandler = () => {
    const msg = {
      type: 'createRoom',
      name: name,
      roomName: roomName,
    }
    //console.log(msg)
    socket.emit('createRoom', msg)
    setProfileName(name)
  }

  const onChangeName = (e) => {
    if (e.target.value.length > 3 && roomName.length > 3) {
      setRoomBtnDisabled(false)
    } else {
      setRoomBtnDisabled(true)
    }
    setName(e.target.value)
  }

  const onChangeRoom = (e) => {
    if (e.target.value.length > 3 && name.length > 3) {
      setRoomBtnDisabled(false)
    } else {
      setRoomBtnDisabled(true)
    }
    setRoomName(e.target.value)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }
  const startEstimation = () => {
    socket.emit('startEstimation', roomId)
    setisEstimationStarted(true)
    setOpen(true)
  }

  const viewResult = () => {
    socket.emit('viewResult', roomId)
    setIsViewResult(true)
  }

  const reset = () => {
    socket.emit('reset', roomId)
    setIsViewResult(false)
    setisEstimationStarted(false)
    setProgress(0)
  }

  const handleDrawerClose = () => {
    setOpenD(false)
  }

  const handleDrawerOpen = () => {
    setOpenD(true)
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

  const url = `/join?id=${roomId}`

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar
        handleDrawerOpen={handleDrawerOpen}
        isError={error}
        estimationEnabled={isEstimationStarted}
        progress={progress}
        cards={cards}
        profileName={profileName}
        open={openD}
      />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: openD,
        })}
      >
        <div className={classes.drawerHeader} />
        {isEstimationStarted && Object.keys(cards).length > 0 && (
          <div className={classes.progress}>
            <LinearProgressWithLabel value={progress} />
          </div>
        )}
        <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
          <Alert onClose={handleClose} severity="success">
            Estimation is open for all team members
          </Alert>
        </Snackbar>
        {error && <Alert severity="error">{errorMsg}</Alert>}
        {!showDashboard && (
          <CreateRoom createHandler={createHandler} onChangeName={onChangeName} onChangeRoom={onChangeRoom} roomBtnDisabled={roomBtnDisabled} />
        )}
        {showDashboard && (
          <Container className={classes.cardGrid} maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Hey <b>{name}</b>!! you're the host today. A room <b>{roomName}</b> has been created. Please ask your team members to join the room
                  through the link.
                  <CopyToClipboard text={'https://' + hostname + '/join?id=' + roomId} onCopy={() => setCopied(true)}>
                    <Tooltip onClose={() => setCopied(false)} title={copied ? 'Link Copied' : 'Copy Link'}>
                      <Button size="small" style={{ marginLeft: '5px' }} variant="outlined" color="primary">
                        Copy Link
                      </Button>
                    </Tooltip>
                  </CopyToClipboard>
                  <div>
                    <i>Caution: Refresh/Reload page will disconnect all connected members and you have to start over.</i>
                  </div>
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Members cards={cards} isEstimateEnabled={isEstimationStarted} isViewResult={isViewResult} />
              </Grid>
              <Grid item xs={12}>
                {Object.keys(cards).length > 0 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Button disabled={isEstimationStarted} onClick={startEstimation} variant="contained" color="primary">
                        Start Estimation
                      </Button>
                      <Button
                        disabled={!isEstimationStarted || isViewResult}
                        onClick={viewResult}
                        style={{ marginLeft: '5px' }}
                        variant="contained"
                        color="primary"
                      >
                        View Result
                      </Button>
                      <Button disabled={!isEstimationStarted} onClick={reset} style={{ marginLeft: '5px' }} variant="contained" color="primary">
                        Reset
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Container>
        )}
        <Footer />
      </main>
      <RightSidebar open={openD} handleDrawerClose={handleDrawerClose} activities={activities} />
    </div>
  )
}
