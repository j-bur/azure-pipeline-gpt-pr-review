import { tl } from './utils/tl';
import { AzureChatOpenAI } from "@langchain/openai";
import { chatPrompt } from "./prompt";

const filesToIgnore = ['GPTPullRequestReview/package-lock.json'];

import { git } from "./utils/git";

export async function reviewFile(
  fileName: string,
  targetBranch: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any
) {
  console.log(`Start reviewing ${fileName} ...`);

  if (fileName in filesToIgnore) {
    console.log('Will not review this file, as it is marked as ignorable.')
    return;
  }

  console.log("targetBranch:")
  console.log(targetBranch)

  console.log("fileName:")
  console.log(fileName)

  const patch = await git.diff([targetBranch, "--", fileName]);
  console.log("patch:")
    console.log(patch)

  try {
    const openAIApiKey = tl.getInput("apiKey", true) as string;

    const isAzure = tl.getBoolInput("useAzure", true);

    const llm = new AzureChatOpenAI({
         azureOpenAIApiKey: isAzure ? openAIApiKey : undefined,
         azureOpenAIApiInstanceName: tl.getInput("azureInstance"),
         azureOpenAIApiDeploymentName: tl.getInput("azureDeployment"),
         azureOpenAIApiVersion: tl.getInput("azureApiVersion"),
         temperature: 0,
         maxTokens: undefined,
         timeout: undefined,
         maxRetries: 0,
       });
    
    const prompt = await chatPrompt.formatPromptValue({ patch });
    console.log("prompt:")
    console.log(prompt)
    const qa = await llm.invoke(prompt);

    console.log("qa:")
    console.log(qa)

    const message = prompt.toChatMessages();

    console.log('messages:')
    console.log(message)

    const flatMessage = message.map((m: { text: any; }) => m.text).join("\n");

    console.info('flatMessage:');
    console.log(flatMessage);

    // const { text: answer } = await qa.call({ query: flatMessage });

    // if (answer) await AddCommentToPR(fileName, answer);

    console.log(`Review of ${fileName} completed.`);
  } catch (error: any) {
    if (error.isAxiosError) {
      console.log({
        status: error.status,
        message: error.message,
      });
    } else {
      console.log(error.message);
    }
  }
}
