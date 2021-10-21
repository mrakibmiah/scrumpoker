import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import GroupIcon from '@material-ui/icons/Group'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

export default function JoinForm(props) {
  const classes = useStyles()
  const { role, handleChangeRole } = props

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <GroupIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Join the team
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="name"
          label="Enter your first name"
          name="name"
          autoComplete="name"
          autoFocus
          onChange={props.onChangeValue}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel id="demo-simple-select-outlined-label">Role</InputLabel>
          <Select labelId="demo-simple-select-outlined-label" id="demo-simple-select-outlined" value={role} onChange={handleChangeRole} label="Role">
            <MenuItem value="developer">Developer</MenuItem>
            <MenuItem value="tester">Tester</MenuItem>
          </Select>
        </FormControl>
        <Button
          onClick={props.joinHandler}
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={!props.joinBtnEnabled}
        >
          Join
        </Button>
      </div>
    </Container>
  )
}
