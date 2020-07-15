import axios from "axios";
import {getJobStatusAbstract, JOB_STATUS_ABSTRACT} from "../constants";

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
  const workflowJobsRes = await axios.get(`https://circleci.com/api/v2/workflow/${workflowId}/job`);
  const jobs = workflowJobsRes.data.items;
  return await Promise.all(
    jobs.map(job => {
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
  ].includes(getJobStatusAbstract(job.status)))
  if (!!activeJob) {
    return await getWorkflowJobs(workflowId)
  }
}
