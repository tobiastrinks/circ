'use strict';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {getWorkflowJobs, refreshWorkflowJobsUnlessFinished, sleep, waitForWorkflowToOccur} from "../services/circleCi";
import importJsx from 'import-jsx';
import execa from "execa";
import {Box} from "ink";

const Workflow = importJsx('./Workflow.js');

class App extends Component {
  constructor() {
    super();
    this.state = {
      jobs: []
    }
  }
  async componentDidMount() {
    const commitHash = this.props.commit || await getLatestCommitFromCurrentDirectory();
    const workflowId = await waitForWorkflowToOccur(commitHash);
    let activeWorkflowJobs = await getWorkflowJobs(workflowId);
    do {
      this.setState({
        jobs: activeWorkflowJobs
      });
      await sleep(3000);
      activeWorkflowJobs = await refreshWorkflowJobsUnlessFinished(workflowId, activeWorkflowJobs)
    } while (!!activeWorkflowJobs)
  }
  render() {
    const {
      jobs
    } = this.state;
    return (
      <Box flexDirection="column">
        { !!jobs.length &&
          <Workflow jobs={jobs} />
        }
      </Box>
    )
  }
}

App.propTypes = {
	command: PropTypes.string
};

App.defaultProps = {
	command: null
};

module.exports = App;

async function getLatestCommitFromCurrentDirectory() {
  try {
    const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
    return stdout
  } catch (e) {
    console.error('Could not determine latest git hash from current directory:', e.stderr);
  }
}
