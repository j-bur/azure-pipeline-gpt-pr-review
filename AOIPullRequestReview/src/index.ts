// import * as tl from "azure-pipelines-task-lib/task";
import { tl } from './utils/tl';
import { Configuration, OpenAIApi } from 'openai';
import { deleteExistingComments } from './pr';
import { reviewFile } from './review';
import { getTargetBranchName } from './utils';
import { getChangedFiles } from './git';
import https from 'https';

export async function run() {
  console.log("index.ts v0.0.3 run()");
  try {
    if (tl.getVariable('Build.Reason') !== 'PullRequest') {
      console.log('Skipping - This task should be run only when the build is triggered from a Pull Request.')
      tl.setResult(tl.TaskResult.Skipped, "This task should be run only when the build is triggered from a Pull Request.");
      return;
    }

    console.log("index.ts: This is a pull request");

    let openai: OpenAIApi | undefined;
    const supportSelfSignedCertificate = tl.getBoolInput('support_self_signed_certificate');
    const apiKey = tl.getInput('api_key', true);
    const aoiEndpoint = tl.getInput('aoi_endpoint');

    if (apiKey == undefined) {
      tl.setResult(tl.TaskResult.Failed, 'No Api Key provided!');
      console.log('No Api Key provided!')
      return;
    }

    console.log("API Key provided.")

    if (aoiEndpoint == undefined) {
      const openAiConfiguration = new Configuration({
        apiKey: apiKey,
      });
      console.log('aoiEndpoint undefined - openAiConfiguration created.')
      openai = new OpenAIApi(openAiConfiguration);
    }

    console.log("index.ts openai created");

    const httpsAgent = new https.Agent({
      rejectUnauthorized: !supportSelfSignedCertificate
    });

    let targetBranch = getTargetBranchName();

    if (!targetBranch) {
      console.log('No target branch found!');
      tl.setResult(tl.TaskResult.Failed, 'No target branch found!');
      return;
    }

    const filesNames = await getChangedFiles(targetBranch);

    console.log("index.ts retrieved changed files");

    if (tl.getVariable('IS_LOCAL_TEST') === 'true'){
      console.log("index.ts: Running locally - will not delete existing comments");
    } else {
      await deleteExistingComments(httpsAgent);
      
    }

    console.log("About to review files.")

    // let c = 0;
    for (const fileName of filesNames) {
      // c++;
      // if (c < 3) continue;
      // if (c > 3) break;
      await reviewFile(targetBranch, fileName, httpsAgent, apiKey, openai, aoiEndpoint)
    }

    tl.setResult(tl.TaskResult.Succeeded, "Pull Request reviewed.");
  }
  catch (err: any) {
    console.log(`index.ts run failed: ${err.message}`)
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();