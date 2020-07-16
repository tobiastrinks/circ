import axios from "axios";
import {getJobStatusAbstract, JOB_STATUS_ABSTRACT, WORKFLOW_COMMANDS} from "../constants";
import execa from "execa";

export async function waitForWorkflowToOccur(commitHash) {
  while(1) {
    const recentJobsRes = await axios.get('https://circleci.com/api/v1.1/recent-builds');
    const matchingJob = recentJobsRes.data.find(i => i.vcs_revision === commitHash);
    if (matchingJob) {
      return matchingJob.workflows.workflow_id
    } else {
      await sleep(5000)
    }
  }
}

export async function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export async function getWorkflowJobs(workflowId) {
  const workflowRes = await axios.get(`https://circleci.com/api/v2/workflow/${workflowId}`);
  const workflowCanceled = workflowRes.data.status === 'canceled';

  const workflowJobsRes = await axios.get(`https://circleci.com/api/v2/workflow/${workflowId}/job`);
  const jobs = workflowJobsRes.data.items;
  return await Promise.all(
    jobs.map(job => {
      if (![JOB_STATUS_ABSTRACT.SUCCESS, JOB_STATUS_ABSTRACT.FAILED].includes(getJobStatusAbstract(job.status)) && workflowCanceled) {
        // CircleCI bug that does not update job status to canceled after workflow cancellation
        job.status = 'canceled'
      }
      const { job_number, project_slug } = job;
      if (!!job_number) {
        return new Promise(async resolve => {
          const res = await axios.get(`https://circleci.com/api/v1.1/project/${project_slug}/${job_number}`);
          resolve({
            ...job,
            detailed: res.data
          })
        })
      } else {
        return Promise.resolve(job)
      }
    })
  );
}

export async function refreshWorkflowJobsUnlessFinished(workflowId, workflowJobs) {
  const activeJob = workflowJobs.find(job => [
    JOB_STATUS_ABSTRACT.WAITING,
    JOB_STATUS_ABSTRACT.BLOCKED,
    JOB_STATUS_ABSTRACT.RUNNING,
    JOB_STATUS_ABSTRACT.ON_HOLD
  ].includes(getJobStatusAbstract(job.status)));
  if (!!activeJob) {
    await sleep(3000);
    return await getWorkflowJobs(workflowId);
  }
}

export async function showOnTheWeb(workflowId) {
  const res = await axios.get(`https://circleci.com/api/v2/workflow/${workflowId}`);
  const {
    project_slug,
    pipeline_number
  } = res.data;
  execa('open', [`https://app.circleci.com/pipelines/${project_slug.replace('gh/', 'github/')}/${pipeline_number}/workflows/${workflowId}`], { shell: true })
}

export async function confirmOnHoldJob(workflowId, workflowJobs) {
  const onHoldJob = getOnHoldJob(workflowJobs);
  if (!!onHoldJob) {
    await axios.post(`https://circleci.com/api/v2/workflow/${workflowId}/approve/${onHoldJob.id}`);
  }
}
function getOnHoldJob(workflowJobs) {
  return workflowJobs.find(job => getJobStatusAbstract(job.status) === JOB_STATUS_ABSTRACT.ON_HOLD)
}

export async function cancelWorkflow(workflowId) {
  await axios.post(`https://circleci.com/api/v2/workflow/${workflowId}/cancel`);
}

export function getAvailableWorkflowCommands(workflowJobs) {
  const availableCommands = [WORKFLOW_COMMANDS.SHOW, WORKFLOW_COMMANDS.CANCEL];
  if (getOnHoldJob(workflowJobs)) {
    availableCommands.push(WORKFLOW_COMMANDS.CONFIRM);
  }
  return availableCommands;
}
