'use strict';
import React, { Component } from 'react';
import {Text, Box} from 'ink';
import PropTypes from "prop-types";
import importJsx from "import-jsx";
import {getJobStatusAbstract} from "../constants";

const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class WorkflowJobSteps extends Component {
  render() {
    const { steps } = this.props;
    return steps.map((step, stepIndex) => (
      <Box key={stepIndex}>
        <WorkflowStatusIcon status={getJobStatusAbstract(step.actions[0].status)} />
        <Text>{step.name}</Text>
      </Box>
    ));
  }
}

WorkflowJobSteps.propTypes = {
  steps: PropTypes.array
};

WorkflowJobSteps.defaultProps = {
  steps: []
};

module.exports = WorkflowJobSteps;
