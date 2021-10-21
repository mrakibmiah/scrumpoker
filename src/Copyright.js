import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';

export default function Copyright() {
  return (
    <Typography variant="body2" color="secondary" align="center">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://fire-fire-stage.cumulus.sebank.se/">
        @devCokepit
      </MuiLink>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
