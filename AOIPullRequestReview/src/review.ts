import fetch from 'node-fetch';
import { git } from './git';
import { OpenAIApi } from 'openai';
import { addCommentToPR } from './pr';
import { Agent } from 'https';
// import * as tl from "azure-pipelines-task-lib/task";
import { tl } from './utils/tl';

export async function reviewFile(targetBranch: string, fileName: string, httpsAgent: Agent, apiKey: string, openai: OpenAIApi | undefined, aoiEndpoint: string | undefined) {
  console.log(`Start reviewing ${fileName} ...`);

  const defaultOpenAIModel = 'gpt-3.5-turbo';
  const patch = await git.diff([targetBranch, '--', fileName]);
  const instructions = tl.getInput('ai_instructions');
  // console.log('reviewFile instructions:')
  // console.log(instructions)

  // const instructions = `Act as a code reviewer of a Pull Request, providing feedback on possible bugs and clean code issues.
  //       You are provided with the Pull Request changes in a patch format.
  //       Each patch entry has the commit message in the Subject line followed by the code changes (diffs) in a unidiff format.

  //       As a code reviewer, your task is:
  //               - Review only added, edited or deleted lines.
  //               - If there's no bugs and the changes are correct, write only 'No feedback.'
  //               - If there's bug or uncorrect code changes, don't write 'No feedback.'`;

  try {
    let choices: any;

    if (openai) {
      console.info("using openAI");
      const response = await openai.createChatCompletion({
        model: tl.getInput('model') || defaultOpenAIModel,
        messages: [
          {
            role: "system",
            content: instructions
          },
          {
            role: "user",
            content: patch
          }
        ],
        max_tokens: 500
      });
      console.log('openai.createChatCompletion response:');
      console.log(response);

      choices = response.data.choices
    }
    else if (aoiEndpoint) {
      console.info("using aoiEndpoint");
      const request = await fetch(aoiEndpoint, {
        method: 'POST',
        headers: { 'api-key': `${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `${instructions}\n, patch : ${patch}}`
          }]
        })
      });
      // console.log('aoiEndpoint request:');
      // console.log(request);

      const response = await request.json() as any;
      // console.log('aoiEndpoint response:');
      // console.log(response);

      choices = response.choices;
    }

    if (choices && choices.length > 0) {
      const review = choices[0].message?.content.trim() as string;

      if (review !== "No feedback.") {
        if (process?.env?.IS_LOCAL_TEST !== "true") {
          await addCommentToPR(fileName, review, httpsAgent);
        } else {
          console.log(
            "review.ts: Running locally - will not add this comment:"
          );
          console.log(review);
          await addCommentToPR(fileName, review, httpsAgent);
        }
      }
    }

    console.log(`Review of ${fileName} completed.`);
  }
  catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}