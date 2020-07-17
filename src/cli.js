import meow from 'meow';
import axios from 'axios';
import {render} from 'ink';
import React from 'react';
import importJsx from 'import-jsx';

const ui = importJsx('./components/App.js');

const meowCli = meow(`
    Usage
      1. Authenticate your current session via the official 1Password CLI
      $ op signin
      
      2. Set environment variable from your 1Password note for your command
      $ openv <secret-note> -c <your-command>
    
      (optional) Install auto-completion for secret note names
      $ openv install-completion

    Options
      --command, -c   The command you want to execute
      --env, -e       Manually overwrite values from 1Password note
    
    Examples
      Login to your database using credentials from 1Password
      $ openv psql-secrets -c psql
      
      Run your web-app with 1Password configuration and overwrite API_URL
      $ openv web-app-env -c "npm run dev" -e "API_URL=http://localhost:3000"
      
      Export secret environment variables in current shell
      $ export $(openv my-secrets)
  `, {
  flags: {
    commit: {
      type: 'string',
      alias: 'c',
    }
  },
});

export default async function cli(args) {
  axios.defaults.auth = {
    username: process.env.CIRCLE_TOKEN || 'c502d28cd75e602ab6797e7c6e2dbf0db49e66c4'
  };
  const { input } = meowCli;
  const props = {};
  if (input[0] === 'list') {
    props.list = true;
  }

  render(React.createElement(ui, props));
}
