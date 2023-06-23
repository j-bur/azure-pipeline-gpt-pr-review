import * as tl from "azure-pipelines-task-lib/task";

export function getTargetBranchName() {
  let targetBranchName = tl.getVariable("System.PullRequest.TargetBranchName");

  if (!targetBranchName) {
    targetBranchName = tl
      .getVariable("System.PullRequest.TargetBranch")
      ?.replace("refs/heads/", "");
  }

  return `origin/${targetBranchName}`;
}
