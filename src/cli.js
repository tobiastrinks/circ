import meow from 'meow';
import axios from 'axios';
import {render} from 'ink';
import React from 'react';
import importJsx from 'import-jsx';
import makeDir from 'make-dir';
import fs from 'fs';
import dotenv from 'dotenv';
import { homedir } from 'os'
import path from 'path'

const ui = importJsx('./components/App.js');

const meowCli = meow(`
    Usage
      Authenticate with your Personal CircleCI Token
      $ circ auth <TOKEN>
      
      Show latest workflow from current directory
      $ circ
      
      List latest CircleCI workflows
      $ circ list
  `, {
  flags: {
    commit: {
      type: 'string',
      alias: 'c',
    }
  },
});

const configDirPath = path.join(homedir(), '.circ')
const configFilePath = `${configDirPath}/config`

export default async function cli() {
  const { input } = meowCli;
  const props = {};

  switch (input[0]) {
    case undefined:
      break;
    case 'auth':
      if (input.length !== 2) return meowCli.showHelp();
      return authenticate(input[1])
    case 'list':
      if (input.length > 1) return meowCli.showHelp();
      props.list = true;
      break;
    default:
      return meowCli.showHelp();
  }

  const token = readTokenFromConfigFile()
  if (!token) {
    return console.error('You have to authenticate first: $ circ auth <TOKEN> \nCreate a Personal API Token here: https://app.circleci.com/settings/user/tokens.')
  }
  setAxiosDefaultAuth(token)
  axios.interceptors.response.use(res => res, (err) => {
    if (err.response && err.response.status === 401) {
      throw 'Your authentication token is invalid. You can create a Personal API Token here: https://app.circleci.com/settings/user/tokens. Then run $ circ auth <TOKEN>'
    }
    return err
  })
  render(React.createElement(ui, props));
}

async function authenticate(token) {
  setAxiosDefaultAuth(token)
  try {
    await axios.get('https://circleci.com/api/v2/me')
  } catch (e) {
    if (e.response && e.response.status === 401) {
      throw 'This token is not valid. You can create a Personal API Token here: https://app.circleci.com/settings/user/tokens'
    } else {
      throw e
    }
  }
  if (fs.existsSync(configDirPath) && !fs.existsSync(configFilePath)) {
    throw '~/.circ already existing, but needed to store authentication token. Please run `rm -r ~/.circ` to proceed.'
  }
  if (!fs.existsSync(configDirPath)) {
    await makeDir(configDirPath, { mode: 0o755 })
  }
  fs.writeFileSync(configFilePath, `CIRCLECI_TOKEN=${token}`, { mode: 0o600 })
}

function readTokenFromConfigFile() {
  if (!fs.existsSync(configFilePath)) {
    return
  }
  const { CIRCLECI_TOKEN } = dotenv.parse(fs.readFileSync(configFilePath))
  return CIRCLECI_TOKEN
}

function setAxiosDefaultAuth(token) {
  axios.defaults.auth = {
    username: token
  };
}
