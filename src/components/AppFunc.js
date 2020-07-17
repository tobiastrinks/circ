// 'use strict';
// import React, { useState, useEffect } from 'react';
// import {
//   cancelWorkflow,
//   confirmOnHoldJob,
//   getAvailableWorkflowCommands,
//   showOnTheWeb,
//   getWorkflowJobs,
//   refreshWorkflowJobsUnlessFinished,
//   waitForWorkflowToOccur,
//   getWorkflowList
// } from "../services/circleCi";
// import importJsx from 'import-jsx';
// import execa from "execa";
// import {Box, Color, Text} from "ink";
// import Spinner from "ink-spinner";
// import PropTypes from "prop-types";
// import { CronJob } from 'cron';
//
// const Workflow = importJsx('./Workflow.js');
// const WorkflowList = importJsx('./WorkflowList.js');
//
// function AppFunc({ list }) {
//   const [state, setState] = useState({
//     workflowList: [],
//     jobs: [],
//     commitHash: '',
//     workflowId: null
//   });
//
//   useEffect(() => {
//     async function loadWorkflowList() {
//       const workflowList = await getWorkflowList();
//       setState((state) => ({ ...state, workflowList }))
//     }
//     async function selectWorkflowForCurrentGitDirectory() {
//       const {
//         commitHash,
//         commitMessage
//       } = await getLatestCommitFromCurrentDirectory();
//       setState((state) => ({ ...state, commitHash, commitMessage }));
//       const workflowId = await waitForWorkflowToOccur(commitHash);
//       setState((state) => ({ ...state, workflowId }));
//     }
//     async function loadSelectedWorkflow() {
//       let activeWorkflowJobs = await getWorkflowJobs(workflowId);
//       cronjob = new CronJob('*/4 * * * * *', async function () {
//         if (!activeWorkflowJobs) {
//           this.stop();
//           setState((state) => ({ ...state, availableWorkflowCommands: []}));
//         } else {
//           setState((state) => ({
//             ...state,
//             jobs: activeWorkflowJobs,
//             availableWorkflowCommands: getAvailableWorkflowCommands(activeWorkflowJobs)
//           }));
//         }
//         activeWorkflowJobs = await refreshWorkflowJobsUnlessFinished(workflowId, activeWorkflowJobs);
//       });
//       cronjob.start();
//     }
//     let cronjob;
//     if (list && !state.workflowId) {
//       loadWorkflowList()
//     } else {
//       if (!state.workflowId) {
//         selectWorkflowForCurrentGitDirectory()
//       } else {
//         loadSelectedWorkflow()
//       }
//     }
//     return function cleanup() {
//       if (cronjob) {
//         cronjob.stop();
//         cronjob = null;
//       }
//       setState((state) => ({ ...state, availableWorkflowCommands: []}));
//     }
//   }, [state.workflowId]);
//
//   function selectWorkflowItem({ commitHash, commitMessage, workflowId }) {
//     setState(state => ({ ...state, commitHash, commitMessage, workflowId }))
//   }
//   function unselectWorkflowItem() {
//     setState(state => ({ ...state, workflowId: null, commitHash: null, commitMessage: null }))
//   }
//
//   const {
//     jobs,
//     commitHash,
//     commitMessage,
//     availableWorkflowCommands,
//     workflowId,
//     workflowList
//   } = state;
//   return (
//     <Box flexDirection="column">
//       { !workflowId && !!workflowList.length &&
//         <WorkflowList workflows={workflowList} selectItem={selectWorkflowItem} />
//       }
//       { !!workflowId &&
//         <Box flexDirection="column" border>
//           <Text bold>🐙 VSC Context</Text>
//           <Text>commit: {commitHash}</Text>
//           {!!commitMessage &&
//           <Text>message: {commitMessage}</Text>
//           }
//         </Box>
//       }
//       { !!workflowId && !jobs.length &&
//         <Box marginTop={1}>
//           <Box marginRight={1}>
//             <Color yellow>
//               <Spinner type="point" />
//             </Color>
//           </Box>
//           <Text bold>Waiting for CircleCI Workflow</Text>
//         </Box>
//       }
//       { !!workflowId && !!jobs.length &&
//         <Workflow
//           jobs={jobs}
//           availableWorkflowCommands={availableWorkflowCommands}
//           showOnTheWeb={showOnTheWeb.bind(this, workflowId, jobs)}
//           confirmOnHoldJob={confirmOnHoldJob.bind(this, workflowId, jobs)}
//           cancelWorkflow={cancelWorkflow.bind(this, workflowId)}
//           gotoWorkflowList={unselectWorkflowItem}
//         />
//       }
//     </Box>
//   )
// }
//
// AppFunc.propTypes = {
//   list: PropTypes.bool
// };
//
// AppFunc.defaultProps = {
//   list: false
// };
//
// module.exports = AppFunc;
//
// async function getLatestCommitFromCurrentDirectory() {
//   try {
//     const commitHash = await execa('git', ['rev-parse', 'HEAD']);
//     const commitMessage = await execa('git log -1 --pretty=format:%B | cat', { shell: true });
//     return { commitHash: commitHash.stdout, commitMessage: commitMessage.stdout }
//   } catch (e) {
//     console.error('Could not determine latest git hash from current directory:', e);
//   }
// }
//
