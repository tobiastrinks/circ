'use strict';
import React, {Component} from 'react';
import {Box, Text} from "ink";
import importJsx from "import-jsx";
import {getJobStatusAbstract} from "../constants";

const WorkflowStatusIcon = importJsx('./WorkflowStatusIcon.js');

class WorkflowListItem extends Component {
  render() {
    const {committer_date, subject, reponame, isSelected, status, branch, job_name, c1Width } = this.props;
    return (
      <Box>
        <Box marginRight={1}>
          <Text color="grey" underline={isSelected}>
            {committer_date}
          </Text>
        </Box>
        <Box width={c1Width}>
          <Text bold underline={isSelected}>
            <Text color="#8DFAFD">{reponame}</Text>:<Text color="#EE776D">{branch}</Text>
          </Text>
        </Box>
        <Box width={35}>
          <Text underline={isSelected}>
            {subject.length > 30 ? `${subject.substr(0, 30)}...` : subject}
          </Text>
        </Box>
        <WorkflowStatusIcon status={getJobStatusAbstract(status)} />
        <Text>[{status}]</Text>
      </Box>
    )
  }
}

module.exports = WorkflowListItem;
