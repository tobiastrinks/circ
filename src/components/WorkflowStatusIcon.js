'use strict';
import React, { Component } from 'react';
import {Text, Color, Box} from 'ink';
import PropTypes from "prop-types";
import Spinner from "ink-spinner";
import {JOB_STATUS_ABSTRACT} from "../constants";

class WorkflowStatusIcon extends Component {
  render() {
    const { status } = this.props;
    return (
      <Box marginRight={1}>
        {this.getIcon(status)}
      </Box>
    )
  }
  getIcon(status) {
    switch (status) {
      case JOB_STATUS_ABSTRACT.RUNNING:
        return (
          <Box>
            <Color yellow>
              <Spinner type="point" />
            </Color>
          </Box>
        )
      case JOB_STATUS_ABSTRACT.SUCCESS:
        return (
          <Text>✅</Text>
        )
      case JOB_STATUS_ABSTRACT.ON_HOLD:
        return (
          <Box marginRight={2}>
            <Text>⏸</Text>
          </Box>
        )
      case JOB_STATUS_ABSTRACT.BLOCKED:
        return (
          <Text>😴</Text>
        )
      case JOB_STATUS_ABSTRACT.FAILED:
        return (
          <Text>❌</Text>
        )
      case JOB_STATUS_ABSTRACT.CANCELED:
        return (
          <Box marginRight={2}>
            <Text>✖️</Text>
          </Box>
        )
      case JOB_STATUS_ABSTRACT.WAITING:
        return (
          <Text>⏳</Text>
        )
      case JOB_STATUS_ABSTRACT.NO_IDEA:
        return (
          <Text>🤷‍</Text>
        )
    }
  }
}

WorkflowStatusIcon.propTypes = {
  status: PropTypes.string
};

module.exports = WorkflowStatusIcon;
