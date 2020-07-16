'use strict';
import React, { Component } from 'react';
import {Text, Box, Color} from 'ink';
import PropTypes from "prop-types";
import importJsx from "import-jsx";
import {getJobStatusAbstract, JOB_STATUS_ABSTRACT} from "../constants";

const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class WorkflowJobSteps extends Component {
  render() {
    const { steps } = this.props;
    return steps.map((step, stepIndex) => {
      const abstractStatus = getJobStatusAbstract(step.actions[0].status);
      return (
        <Box key={stepIndex}>
          <WorkflowStatusIcon status={abstractStatus}/>
          <Text>{step.name}</Text>
        </Box>
      )
    });
  }
}

WorkflowJobSteps.propTypes = {
  steps: PropTypes.array
};

WorkflowJobSteps.defaultProps = {
  steps: []
};

module.exports = WorkflowJobSteps;
