'use strict';
import React, { useState, useEffect } from 'react';
import {
  cancelWorkflow,
  confirmOnHoldJob,
  getWorkflowJobs,
  refreshWorkflowJobsUnlessFinished,
  waitForWorkflowToOccur
} from "../services/circleCi";
import importJsx from 'import-jsx';
import execa from "execa";
import {Box, Color, Text, useStdin} from "ink";
import Spinner from "ink-spinner";
import {RUNTIME_COMMANDS} from "../constants";

const Workflow = importJsx('./Workflow.js');

function App({ commit }) {
  const [state, setState] = useState({
    jobs: [],
    commitHash: ''
  });

  const {stdin} = useStdin();

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
      setState({
        ...state,
        commitHash,
        commitMessage
      });
      const workflowId = await waitForWorkflowToOccur(commitHash);
      let activeWorkflowJobs = await getWorkflowJobs(workflowId);
      stdin.on('data', (data) => {
        switch (data.toString().trim()) {
          case RUNTIME_COMMANDS.CONFIRM:
            return confirmOnHoldJob(workflowId, activeWorkflowJobs);
          case RUNTIME_COMMANDS.CANCEL:
            return cancelWorkflow(workflowId);
        }
      });
      do {
        setState({
          ...state,
          jobs: activeWorkflowJobs,
          commitHash,
          commitMessage
        });
        activeWorkflowJobs = await refreshWorkflowJobsUnlessFinished(workflowId, activeWorkflowJobs)
      } while (!!activeWorkflowJobs);
      stdin.destroy()
    }
    asyncUseEffect()
  }, []);

  const {
    jobs,
    commitHash,
    commitMessage
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
        <Workflow jobs={jobs} />
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
