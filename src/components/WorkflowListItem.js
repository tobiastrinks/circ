'use strict';
import React, { Component } from 'react';
import {Box, Color, Text} from "ink";
import importJsx from "import-jsx";
import {getJobStatusAbstract} from "../constants";

const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class WorkflowListItem extends Component {
  render() {
    const {committer_date, subject, reponame, isSelected, status, branch, job_name, c1Width } = this.props;
    return (
      <Box>
        <Text underline={isSelected}>
          <Box marginRight={1}>
            <Color grey>
              {committer_date}
            </Color>
          </Box>
          <Box width={c1Width}>
            <Text bold>
              <Color hex={'#8DFAFD'}>{reponame}</Color>:<Color hex={'#EE776D'}>{branch}</Color>
            </Text>
          </Box>
          <Box width={35}>
            {subject.length > 30 ? `${subject.substr(0, 30)}...` : subject}
          </Box>
          <WorkflowStatusIcon status={getJobStatusAbstract(status)} />
          <Text>[{status}]</Text>
        </Text>
      </Box>
    )
  }
}

module.exports = WorkflowListItem;
