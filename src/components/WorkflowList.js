'use strict';
import React, {Component} from 'react';
import PropTypes from "prop-types";
import InkSelectInput from "ink-select-input";
import importJsx from "import-jsx";

const WorkflowListItem = importJsx('./WorkflowListItem.js');

class WorkflowList extends Component {
  constructor() {
    super();
    this.handleSelect = this.handleSelect.bind(this)
  }
  render() {
    const { workflows } = this.props;
    const c1Width = Math.max(...workflows.map(w => w.reponame.length + w.branch.length + 4));
    const items = workflows.map(w => ({
      ...w,
      value: w.id,
      c1Width
    }));
    return (
      <InkSelectInput
        items={items}
        itemComponent={WorkflowListItem}
        onSelect={this.handleSelect}
      />
    )
  }
  handleSelect(item) {
    this.props.selectItem({
      commitHash: item.vcs_revision,
      commitMessage: item.subject,
      workflowId: item.id
    })
  }
}

WorkflowList.propTypes = {
  workflows: PropTypes.array
};

WorkflowList.defaultProps = {
  workflows: []
};

module.exports = WorkflowList;
