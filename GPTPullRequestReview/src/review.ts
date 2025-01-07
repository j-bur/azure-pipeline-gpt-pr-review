// import * as tl from "azure-pipelines-task-lib/task";
import { tl } from './utils/tl';
import { DeleteExistingComments } from "./DeleteExistingComments";
import { GetChangedFiles } from "./GetChangedFiles";
import { LoadProjectContext } from "./LoadProjectContext";
import { getTargetBranchName } from "./getTargetBranchName";
import { reviewFile } from "./reviewFile";
// import express from 'express';
// import rateLimit from 'express-rate-limit';

// const app = express();

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });

// app.use(limiter);

export async function run() {
  try {
    const allowed = ["PullRequest"].includes(
      tl.getVariable("Build.Reason") as string
    ) || process?.env?.IS_LOCAL_TEST === 'true';

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
      if (process?.env?.IS_LOCAL_TEST !== 'true') {
        await DeleteExistingComments();
      } else { 
        console.log('Running locally - will not delete existing comments')
      }
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
        tl.TaskResult.SucceededWithIssues,
        `Failed task with error: ${error.message}`
      );
    }

    const retriever = await LoadProjectContext(
      tl.getVariable("System.DefaultWorkingDirectory") as string
    );

    let c = 0;
    for await (const fileName of filesNames) {
      c++;
      if (c < 3) continue;
      if (c === 5) break;
      console.log('<-------------BEGIN REVIEWING FILE-------------')
      await reviewFile(fileName, targetBranch, retriever);
      console.log('--------------END REVIEWING FILE-------------->')
      
    }

    tl.setResult(tl.TaskResult.Succeeded, "Pull Request reviewed.");
  } catch (err: any) {
    console.log('review run caught an error:')
    console.log(err)
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
