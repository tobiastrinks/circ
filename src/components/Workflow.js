'use strict';
import React, {Component} from 'react';
import {Box, Text} from 'ink';
import PropTypes from "prop-types";
import importJsx from "import-jsx";
import {getJobStatusAbstract, JOB_STATUS_ABSTRACT, WORKFLOW_COMMANDS} from "../constants";
import InkTextInput from "ink-text-input";

const WorkflowJobSteps = importJsx('./WorkflowJobSteps.js');
const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class Workflow extends Component {
  constructor() {
    super();
    this.state = {
      commandInput: ''
    }
    this.handleCommandChange = this.handleCommandChange.bind(this);
    this.handleCommandSubmit = this.handleCommandSubmit.bind(this);
  }
  render() {
    const { availableWorkflowCommands } = this.props;
    const jobs = this.props.jobs.map((job, index) => {
      const abstractStatus = getJobStatusAbstract(job.status);
      return (
        <Box key={index} flexDirection="column" marginBottom={1} marginTop={1}>
          <Box>
            <WorkflowStatusIcon status={abstractStatus} />
            <Text backgroundColor={abstractStatus === JOB_STATUS_ABSTRACT.ON_HOLD ? '#4f4f00' : null}>
              <Text bold={true}>{job.name}</Text>
              <Text> [{job.status}]</Text>
            </Text>
          </Box>
          <Box flexDirection="column" marginLeft={4}>
            { !!job.detailed && <WorkflowJobSteps steps={job.detailed.steps} /> }
          </Box>
        </Box>
      )
    });
    return (
      <Box flexDirection="column">
        {jobs}
        { !!availableWorkflowCommands.length && (
            <Box marginTop={2} flexDirection="column">
              <Text bold>Available commands:</Text>
              { availableWorkflowCommands.includes(WORKFLOW_COMMANDS.SHOW) && (
                <Box>
                  <Box width={10}><Text color="yellow">show</Text></Box>
                  <Text>Open workflow on the web</Text>
                </Box>
              )}
              { availableWorkflowCommands.includes(WORKFLOW_COMMANDS.CONFIRM) && (
                <Box>
                  <Box width={10}><Text color="yellow">confirm</Text></Box>
                  <Text>Continue on_hold workflow</Text>
                </Box>
              )}
              { availableWorkflowCommands.includes(WORKFLOW_COMMANDS.CANCEL) && (
                <Box>
                  <Box width={10}><Text color="yellow">cancel</Text></Box>
                  <Text>Abort workflow</Text>
                </Box>
              )}
              { availableWorkflowCommands.includes(WORKFLOW_COMMANDS.LIST) && (
                <Box>
                  <Box width={10}><Text color="yellow">list</Text></Box>
                  <Text>Go to workflow overview</Text>
                </Box>
              )}
              <Box>
                <Box marginRight={1}>
                  <Text>$</Text>
                </Box>
                <InkTextInput value={this.state.commandInput} onChange={this.handleCommandChange} onSubmit={this.handleCommandSubmit} />
              </Box>
            </Box>
          )
        }
      </Box>
    )
  }
  handleCommandChange(commandInput) {
    this.setState({commandInput})
  }
  handleCommandSubmit() {
    const { commandInput } = this.state;
    const {
      availableWorkflowCommands,
      showOnTheWeb,
      confirmOnHoldJob,
      cancelWorkflow,
      gotoWorkflowList
    } = this.props;
    if (!availableWorkflowCommands.includes(commandInput)) {
      return
    }
    this.setState({commandInput: ''})
    switch (commandInput) {
      case WORKFLOW_COMMANDS.SHOW:
        showOnTheWeb();
        break;
      case WORKFLOW_COMMANDS.CONFIRM:
        confirmOnHoldJob();
        break;
      case WORKFLOW_COMMANDS.CANCEL:
        cancelWorkflow();
        break;
      case WORKFLOW_COMMANDS.LIST:
        gotoWorkflowList();
        break;
    }
  }
}

Workflow.propTypes = {
  jobs: PropTypes.array,
  availableWorkflowCommands: PropTypes.array
};

Workflow.defaultProps = {
  jobs: [],
  default: []
};

module.exports = Workflow;
