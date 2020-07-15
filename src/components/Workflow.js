'use strict';
import React, { Component } from 'react';
import {Text, Box} from 'ink';
import PropTypes from "prop-types";
import importJsx from "import-jsx";
import {getJobStatusAbstract} from "../constants";

const WorkflowJobSteps = importJsx('./WorkflowJobSteps.js');
const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class Workflow extends Component {
  render() {
    return this.props.jobs.map((job, index) => {
      return (
        <Box key={index} flexDirection="column" marginBottom={1} marginTop={1}>
          <Box>
            <WorkflowStatusIcon status={getJobStatusAbstract(job.status)} />
            <Text bold={true}>{job.name}</Text>
            <Text> [{job.status}]</Text>
          </Box>
          <Box flexDirection="column" marginLeft={4}>
            { !!job.detailed && <WorkflowJobSteps steps={job.detailed.steps} /> }
          </Box>
        </Box>
      )
    });
  }
}

Workflow.propTypes = {
  jobs: PropTypes.array
};

Workflow.defaultProps = {
  jobs: []
};

module.exports = Workflow;
