'use strict';
import React, { Component } from 'react';
import {Text, Box, Color, useStdin} from 'ink';
import PropTypes from "prop-types";
import importJsx from "import-jsx";
import {getJobStatusAbstract, JOB_STATUS_ABSTRACT} from "../constants";

const WorkflowJobSteps = importJsx('./WorkflowJobSteps.js');
const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class Workflow extends Component {
  render() {
    return this.props.jobs.map((job, index) => {
      const abstractStatus = getJobStatusAbstract(job.status);
      return (
        <Box key={index} flexDirection="column" marginBottom={1} marginTop={1}>
          <Box>
            <WorkflowStatusIcon status={abstractStatus} />
            <Color bgHex={abstractStatus === JOB_STATUS_ABSTRACT.ON_HOLD ? '#4f4f00' : null}>
              <Text bold={true}>{job.name}</Text>
              <Text> [{job.status}]</Text>
            </Color>
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
