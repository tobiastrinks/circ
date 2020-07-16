'use strict';
import React, { useState, useEffect } from 'react';
import {
  cancelWorkflow,
  confirmOnHoldJob,
  getAvailableWorkflowCommands,
  showOnTheWeb,
  getWorkflowJobs,
  refreshWorkflowJobsUnlessFinished,
  waitForWorkflowToOccur
} from "../services/circleCi";
import importJsx from 'import-jsx';
import execa from "execa";
import {Box, Color, Text} from "ink";
import Spinner from "ink-spinner";

const Workflow = importJsx('./Workflow.js');

function App({ commit }) {
  const [state, setState] = useState({
    jobs: [],
    commitHash: ''
  });

  useEffect(() => {
    async function extractGitCommit() {
      if (commit) {
        return { commitHash: commit };
      } else {
        return await getLatestCommitFromCurrentDirectory();
      }
    }
    async function asyncUseEffect() {
      const {
        commitHash,
        commitMessage
      } = await extractGitCommit();
      setState((state) => ({
        ...state,
        commitHash,
        commitMessage
      }));
      const workflowId = await waitForWorkflowToOccur(commitHash);
      let activeWorkflowJobs = await getWorkflowJobs(workflowId);
      do {
        setState((state) => ({
          ...state,
          workflowId,
          jobs: activeWorkflowJobs,
          availableWorkflowCommands: getAvailableWorkflowCommands(activeWorkflowJobs),
          commitHash,
          commitMessage
        }));
        activeWorkflowJobs = await refreshWorkflowJobsUnlessFinished(workflowId, activeWorkflowJobs)
      } while (!!activeWorkflowJobs);
      setState((state) => ({ ...state, availableWorkflowCommands: []}))
    }
    asyncUseEffect()
  }, []);

  const {
    jobs,
    commitHash,
    commitMessage,
    availableWorkflowCommands,
    workflowId
  } = state;
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" border>
        <Text bold>🐙  VSC Context</Text>
        <Text>commit: {commitHash}</Text>
        { !!commitMessage &&
        <Text>message: {commitMessage}</Text>
        }
      </Box>
      { !jobs.length &&
        <Box marginTop={1}>
          <Box marginRight={1}>
            <Color yellow>
              <Spinner type="point" />
            </Color>
          </Box>
          <Text bold>Waiting for CircleCI Workflow</Text>
        </Box>
      }
      { !!jobs.length &&
        <Workflow
          jobs={jobs}
          availableWorkflowCommands={availableWorkflowCommands}
          showOnTheWeb={showOnTheWeb.bind(this, workflowId, jobs)}
          confirmOnHoldJob={confirmOnHoldJob.bind(this, workflowId, jobs)}
          cancelWorkflow={cancelWorkflow.bind(this, workflowId)}
        />
      }
    </Box>
  )
}

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
