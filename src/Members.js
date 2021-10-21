import React, { useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { Badge, Box, Button, Card, CardActionArea, CardActions, CardContent, Grid, Paper } from '@material-ui/core'
import PeopleIcon from '@material-ui/icons/People'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import CardMedia from '@material-ui/core/CardMedia'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import Image from 'next/image'
import ResultBoard from './resultBoard'

const useStyles = makeStyles((theme) => ({
  cardContent: {
    flexGrow: 1,
    display: 'flex',
  },
  avatar: {
    backgroundColor: '#556CD6',
    textAlign: 'right',
  },
  result: {
    fontSize: '115px',
    textAlign: 'center',
    height: '180px',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  root: {
    maxWidth: 190,
  },
  media: {
    height: 200,
  },
}))

export default function Members(props) {
  const classes = useStyles()
  const cards = props.cards
  const isViewResult = props.isViewResult

  const getImageName = (name)=> {
    const imgNames = ['kazimieras', 'gediminas', 'evaldas','dinesh','rakib','shahid','no-img']
    name = name.toLowerCase()
    if (imgNames.includes(name)) {
      return `${name}.png`
    }
    return 'no-img.png'
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography paragraph={true} variant="subtitle1" align="center" component="div">
          <Badge badgeContent={Object.keys(cards).length} color="primary">
            {Object.keys(cards).length > 0 ? (
              <div>
                Participated team members <PeopleIcon />
              </div>
            ) : (
              'Waiting for the team members to join...'
            )}
          </Badge>
        </Typography>
      </Grid>

      {isViewResult && (
        <Grid item xs={12}>
          <ResultBoard cards={cards} />
        </Grid>
      )}

      {!isViewResult &&
        Object.keys(cards).map((card, index) => (
          <Grid item key={cards[card].name} xs={12} sm={2}>
            <Card className={classes.root}>
              <CardActionArea>
                <CardMedia className={classes.media} image={getImageName(cards[card].name)} title="Contemplative Reptile" />
                <CardContent>
                  <Grid container>
                    <Grid item xs={cards[card].voted ? 10 : 12}>
                      <Typography variant="subtitle1" gutterBottom>
                        {cards[card].name}
                      </Typography>
                    </Grid>
                    {cards[card].voted && (
                      <Grid item xs={2}>
                        <ThumbUpIcon />
                      </Grid>
                    )}
                  </Grid>
                  {cards[card].voted ? (
                    <div style={{ fontSize: '11px' }}>Estimated</div>
                  ) : (
                    <div style={{ fontSize: '11px' }}>{props.isEstimateEnabled ? 'Waiting for an estimation' : ''}</div>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
    </Grid>
  )
}
