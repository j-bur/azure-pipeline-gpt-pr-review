import * as tl from "azure-pipelines-task-lib/task";
import { DeleteExistingComments } from "./DeleteExistingComments";
import { GetChangedFiles } from "./GetChangedFiles";
import { LoadProjectContext } from "./LoadProjectContext";
import { getTargetBranchName } from "./getTargetBranchName";
import { reviewFile } from "./reviewFile";

async function run() {
  try {
    const allowed = ["PullRequest", "Manual"].includes(
      tl.getVariable("Build.Reason") as string
    );

    if (!allowed) {
      tl.setResult(
        tl.TaskResult.Skipped,
        "This task should be run only when the build is triggered from a Pull Request."
      );
      return;
    }

    // tl.setResult(tl.TaskResult.Failed, "No Api Key provided!");

    const targetBranch = getTargetBranchName();

    const filesNames = await GetChangedFiles(targetBranch);

    try {
      await DeleteExistingComments();
    } catch (error: any) {
      if (error.isAxiosError) {
        console.log({
          status: error.status,
          message: error.message,
        });
      } else {
        console.log(error.message);
      }

      tl.setResult(
        tl.TaskResult.Failed,
        `Failed task with error: ${error.message}`
      );
    }

    const retriever = await LoadProjectContext(
      tl.getVariable("System.DefaultWorkingDirectory") as string
    );

    for await (const fileName of filesNames) {
      await reviewFile(fileName, targetBranch, retriever);
    }

    tl.setResult(tl.TaskResult.Succeeded, "Pull Request reviewed.");
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

export function getFileExtension(fileName: string) {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

run();
