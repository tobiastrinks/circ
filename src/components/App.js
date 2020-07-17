'use strict';
import React from 'react';
import {
  cancelWorkflow,
  confirmOnHoldJob,
  getAvailableWorkflowCommands,
  showOnTheWeb,
  getWorkflowJobs,
  waitForWorkflowToOccur,
  getWorkflowList, areWorkflowJobsFinished
} from "../services/circleCi";
import importJsx from 'import-jsx';
import execa from "execa";
import {Box, Color, Text} from "ink";
import Spinner from "ink-spinner";
import PropTypes from "prop-types";

import { Component } from 'react';
const Workflow = importJsx('./Workflow.js');
const WorkflowList = importJsx('./WorkflowList.js');

class App extends Component {
  constructor() {
    super();
    this.state = {
      workflowList: [],
      jobs: [],
      commitHash: '',
      workflowId: null,
      availableWorkflowCommands: []
    };
    this.loadWorkflowList = this.loadWorkflowList.bind(this);
    this.selectWorkflowForCurrentGitDirectory = this.selectWorkflowForCurrentGitDirectory.bind(this);
    this.loadSelectedWorkflow = this.loadSelectedWorkflow.bind(this);
    this.refreshActiveWorkflow = this.refreshActiveWorkflow.bind(this);
    this.selectWorkflowItem = this.selectWorkflowItem.bind(this);
    this.unselectWorkflowItem = this.unselectWorkflowItem.bind(this);
  }
  async componentDidMount() {
    const { list } = this.props;
    if (list) {
      await this.loadWorkflowList();
    } else {
      await this.selectWorkflowForCurrentGitDirectory();
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    const { workflowId } = this.state;
    if (workflowId !== prevState.workflowId) {
      if (workflowId) {
        await this.loadSelectedWorkflow();
      } else {
        await this.loadWorkflowList();
      }
    }
  }
  async loadWorkflowList() {
    const workflowList = await getWorkflowList();
    this.setState({ workflowList })
  }
  async selectWorkflowForCurrentGitDirectory() {
    const {
      commitHash,
      commitMessage
    } = await getLatestCommitFromCurrentDirectory();
    this.setState({ commitHash, commitMessage });
    const workflowId = await waitForWorkflowToOccur(commitHash);
    this.setState({ workflowId });
  }
  async loadSelectedWorkflow() {
    const { workflowId } = this.state;
    let activeWorkflowJobs = await getWorkflowJobs(workflowId);
    this.setState({ jobs: activeWorkflowJobs });
    if (!areWorkflowJobsFinished(activeWorkflowJobs)) {
      this.setState({ availableWorkflowCommands: getAvailableWorkflowCommands(activeWorkflowJobs) });
      this.refreshActiveWorkflow(workflowId, activeWorkflowJobs)
    }
  }
  async refreshActiveWorkflow(workflowId, activeWorkflowJobs) {
    do {
      activeWorkflowJobs = await getWorkflowJobs(workflowId);
      if (workflowId !== this.state.workflowId) {
        break
      }
      this.setState({
        jobs: activeWorkflowJobs,
        availableWorkflowCommands: getAvailableWorkflowCommands(activeWorkflowJobs)
      });
    } while (!areWorkflowJobsFinished(activeWorkflowJobs));
    this.setState({ availableWorkflowCommands: [] });
  }
  selectWorkflowItem({ commitHash, commitMessage, workflowId }) {
    this.setState({ commitHash, commitMessage, workflowId })
  }
  unselectWorkflowItem() {
    this.setState({ workflowId: null, commitHash: null, commitMessage: null, jobs: [], availableWorkflowCommands: [] })
  }
  render() {
    const {
      jobs,
      commitHash,
      commitMessage,
      availableWorkflowCommands,
      workflowId,
      workflowList
    } = this.state;
    return (
      <Box flexDirection="column">
        { !workflowId && !!workflowList.length &&
        <WorkflowList workflows={workflowList} selectItem={this.selectWorkflowItem} />
        }
        { !!workflowId &&
        <Box flexDirection="column" border>
          <Text bold>🐙 VSC Context</Text>
          <Text>commit: {commitHash}</Text>
          {!!commitMessage &&
          <Text>message: {commitMessage}</Text>
          }
        </Box>
        }
        { !!workflowId && !jobs.length &&
        <Box marginTop={1}>
          <Box marginRight={1}>
            <Color yellow>
              <Spinner type="point" />
            </Color>
          </Box>
          <Text bold>Waiting for CircleCI Workflow</Text>
        </Box>
        }
        { !!workflowId && !!jobs.length &&
        <Workflow
          jobs={jobs}
          availableWorkflowCommands={availableWorkflowCommands}
          showOnTheWeb={showOnTheWeb.bind(this, workflowId, jobs)}
          confirmOnHoldJob={confirmOnHoldJob.bind(this, workflowId, jobs)}
          cancelWorkflow={cancelWorkflow.bind(this, workflowId)}
          gotoWorkflowList={this.unselectWorkflowItem}
        />
        }
      </Box>
    )
  }
}

App.propTypes = {
  list: PropTypes.bool
};

App.defaultProps = {
  list: false
};

module.exports = App;

async function getLatestCommitFromCurrentDirectory() {
  try {
    const commitHash = await execa('git', ['rev-parse', 'HEAD']);
    const commitMessage = await execa('git log -1 --pretty=format:%B | cat', { shell: true });
    return { commitHash: commitHash.stdout, commitMessage: commitMessage.stdout }
  } catch (e) {
    console.error('Could not determine latest git hash from current directory:', e);
  }
}
