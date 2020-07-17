import React from "react";

const JOB_STATUS_V1 = {
  SUCCESS: 'success',
  RUNNING: 'running',
  CANCELED: 'canceled',
  ON_HOLD: 'on_hold',
  BLOCKED: 'blocked',
  FAILED: 'failed',
  RETRIED: 'retried',
  INFRA_FAIL: 'infrastructure_fail',
  TIMEOUT: 'timedout',
  NOT_RUN: 'not_run',
  NOT_RUNNING: 'not_running',
  QUEUED: 'queued',
  SCHEDULED: 'scheduled',
  NO_TESTS: 'no_tests',
  FIXED: 'fixed',
};

const JOB_STATUS_V2 = {
  SUCCESS: 'success',
  RUNNING: 'running',
  NOT_RUN: 'not_run',
  FAILED: 'failed',
  ERROR: 'error',
  FAILING: 'failing',
  ON_HOLD: 'on_hold',
  CANCELED: 'canceled',
  UNAUTHORIZED: 'unauthorized'
};

export const JOB_STATUS_ABSTRACT = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  ON_HOLD: 'ON_HOLD',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  WAITING: 'WAITING',
  BLOCKED: 'BLOCKED',
  NO_IDEA: 'NO_IDEA'
};

export function getJobStatusAbstract(status) {
  switch (status) {
    case JOB_STATUS_V1.NOT_RUN:
    case JOB_STATUS_V1.NOT_RUNNING:
    case JOB_STATUS_V1.QUEUED:
    case JOB_STATUS_V2.NOT_RUN:
      return JOB_STATUS_ABSTRACT.WAITING;

    case JOB_STATUS_V1.BLOCKED:
    case JOB_STATUS_V2.BLOCKED:
      return JOB_STATUS_ABSTRACT.BLOCKED;

    case JOB_STATUS_V1.RUNNING:
    case JOB_STATUS_V2.RUNNING:
      return JOB_STATUS_ABSTRACT.RUNNING;

    case JOB_STATUS_V1.ON_HOLD:
    case JOB_STATUS_V2.ON_HOLD:
      return JOB_STATUS_ABSTRACT.ON_HOLD;

    case JOB_STATUS_V1.SUCCESS:
    case JOB_STATUS_V2.SUCCESS:
      return JOB_STATUS_ABSTRACT.SUCCESS;

    case JOB_STATUS_V1.FAILED:
    case JOB_STATUS_V2.ERROR:
    case JOB_STATUS_V2.FAILED:
    case JOB_STATUS_V2.FAILING:
      return JOB_STATUS_ABSTRACT.FAILED;

    case JOB_STATUS_V1.CANCELED:
    case JOB_STATUS_V2.CANCELED:
      return JOB_STATUS_ABSTRACT.CANCELED;

    default:
      return JOB_STATUS_ABSTRACT.NO_IDEA;
  }
}

export const WORKFLOW_COMMANDS = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  SHOW: 'show',
  LIST: 'list',
};
