import { Server as ServerIO } from 'socket.io'

let clientConnections = {}
let userActivities = {}
let roomMembers = {}
let rooms = {}
let roomData = {}

const sendMessage = (eventName, roomId, payload, isHost) => {
  if (!roomMembers[roomId]) {
    console.log('Unable to send message for', roomId, roomMembers)
    return
  }
  console.log('sendMessage payload', payload)
  roomMembers[roomId].map((member) => {
    clientConnections[member.sessionId].emit(eventName, payload)
  })
  // send to host, room creator
  const hostPayload = {
    members: roomMembers[roomId],
    activities: userActivities[roomId],
    roomData: roomData[roomId],
  }
  if (isHost) clientConnections[roomId].emit(eventName, hostPayload)
}

const checkAvailableRoom = (socketId, roomId) => {
  if (roomId && !roomMembers[roomId]) {
    const msg = `either ${roomId} room Id does not exist or connection problem. please refresh the page and try again.`
    clientConnections[socketId].emit('errorMember', msg)
    return false
  }

  return true
}

export default async (req, res) => {
  if (!res.socket.server.io) {
    console.log('New Socket.io server has been connected...')
    // adapt Next's net Server to http Server
    const httpServer = res.socket.server
    const io = new ServerIO(httpServer, {
      path: '/api/push-service',
    })
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io
  }

  res.socket.server.io.on('connection', (socket) => {
    console.log(`connected.....`, socket.id)
    const socketId = socket.id
    clientConnections[socketId] = socket
    console.log(`Connection details`, userActivities)

    socket.on('join', (payload) => {
      const roomId = payload.roomId
      console.log(`join incoming payload`, payload, userActivities)
      if (!checkAvailableRoom(socketId, roomId)) {
        return
      }
      if (userActivities[roomId]) {
        userActivities[roomId].push(`${payload.name} has joint`)
      }

      const joinMembers = {
        name: payload.name,
        role: payload.role,
        sessionId: socketId,
        roomId: roomId,
        activities: userActivities[roomId],
      }
      roomMembers[roomId].push(joinMembers)

      const joinPayload = {
        members: roomMembers[roomId],
        roomData: roomData[roomId],
        roomId: roomId,
        activities: userActivities[roomId],
      }

      sendMessage('joinNewMember', roomId, joinPayload, true)
      console.log('Join Member', roomMembers)
    })

    socket.on('createRoom', (payload) => {
      console.log(`createRoom incoming payload`, payload)
      roomMembers[socketId] = []
      rooms[socketId] = payload

      // initialize default rooms settings
      roomData[socketId] = {
        viewResult: false,
        estimationEnabled: false,
        reset: false,
      }
      userActivities[socketId] = []
      userActivities[socketId].push(`${payload.name} created a room`)
      clientConnections[socketId].emit('roomCreated', { socketId, payload, activities: userActivities[socketId] })
      console.log('Create room', roomMembers, roomData)
    })

    socket.on('startEstimation', (roomId) => {
      console.log(`startEstimation incoming payload`, roomId)
      userActivities[roomId].push(`Estimation has started`)

      roomData[roomId].estimationEnabled = true
      roomData[roomId].reset = false
      roomData[roomId].viewResult = false

      const startPayload = {
        members: roomMembers[roomId],
        roomId: roomId,
        roomData: roomData[roomId],
        roomInfo: rooms[roomId],
        activities: userActivities[roomId],
      }

      sendMessage('startEstimation', roomId, startPayload, false)
      console.log('Triggger start estimation', roomMembers)
    })

    socket.on('disconnect', (reason) => {
      console.log(`disconnect..`, reason)
    })

    socket.on('submitEstimation', (payload) => {
      console.log(`submitEstimation..`, payload)
      const roomId = payload.roomId
      userActivities[roomId].push(`${payload.name} has estimated`)
      roomMembers[roomId].map((member) => {
        if (member.sessionId === socketId) {
          member.voted = true
          member.value = payload.value
        }
      })

      const votePayload = {
        members: roomMembers[roomId],
        roomId: roomId,
        roomData: roomData[roomId],
        activities: userActivities[roomId],
      }

      sendMessage('estimationSubmitted', roomId, votePayload, true)
      console.log('submitEstimation Members', roomMembers)
    })

    socket.on('viewResult', (roomId) => {
      console.log(`viewResult..`, roomId)
      userActivities[roomId].push(`published result`)

      roomData[roomId].estimationEnabled = false
      roomData[roomId].reset = false
      roomData[roomId].viewResult = true

      const resultPayload = {
        members: roomMembers[roomId],
        roomId: roomId,
        roomData: roomData[roomId],
        activities: userActivities[roomId],
      }

      sendMessage('resultPublished', roomId, resultPayload, false)
      console.log('Triggger result', roomMembers)
    })

    socket.on('reset', (roomId) => {
      console.log(`viewResult..`, roomId)
      userActivities[roomId].push(`Trigger reset`)
      roomMembers[roomId].map((member) => {
        member.voted = false
        member.value = ''
      })

      roomData[roomId].reset = true
      roomData[roomId].estimationEnabled = false
      roomData[roomId].viewResult = false

      const resetPayload = {
        members: roomMembers[roomId],
        roomId: roomId,
        roomData: roomData[roomId],
        activities: userActivities[roomId],
      }

      sendMessage('resetTriggered', roomId, resetPayload, true)
      console.log('Triggger reset', roomMembers)
    })
    socket.on('disconnect', (reason) => {
      console.log(`disconnect..`, reason)
      let ts = Date.now()
      console.log(`time..`, new Date(ts))
      delete clientConnections[socketId]
      console.log('WebSocket was closed start', roomMembers, socketId)

      let roomId
      let memberName
      // if this is not a host, then find the room id for that member
      if (JSON.stringify(roomMembers) !== '{}' && !roomMembers[socketId]) {
        Object.keys(roomMembers).map((sessId) => {
          const members = roomMembers[sessId]
          const filterMembers = members.filter((member) => {
            if (member.sessionId !== socketId) {
              return true
            } else {
              memberName = member.name
              return false
            }
          })

          if (members.length !== filterMembers.length) {
            roomMembers[sessId] = filterMembers
            roomId = sessId
            return
          }
        })

        if (roomId) {
          //userActivities[roomId].push(`${roomId} member has left`)
          const closePayload = {
            members: roomMembers[roomId],
            activities: userActivities[roomId],
            roomData: roomData[roomId],
          }
          userActivities[roomId].push(`${memberName} has left`)
          console.log('Connection closed for member', roomMembers, roomId, roomData)
          sendMessage('memberLeft', roomId, closePayload, true)
        }
      } else {
        console.log('Connection closed for host', socketId)
        // if host has left, then kick out all connected members
        // if (sessionId) userActivities[sessionId].push(`member has left`)
        const hostLeftPayload = {
          hostLeft: true,
          activities: userActivities[socketId],
        }
        delete userActivities[socketId]
        sendMessage('hostLeft', socketId, hostLeftPayload, false)
        delete roomMembers[socketId]
        delete roomData[socketId]
      }
      delete rooms[socketId]
      console.log('WebSocket Closed end', roomMembers, roomData)
    })

    socket.on('error', (socket) => {
      socket.emit('error', 'Hey client, socket connection is in error state, please refresh the page to rejoin')
    })
  })

  res.end()
}
