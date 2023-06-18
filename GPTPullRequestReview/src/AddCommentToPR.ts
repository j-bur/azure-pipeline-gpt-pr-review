import axios from "axios";
import tl from "azure-pipelines-task-lib/task";

export async function AddCommentToPR(fileName: string, comment: string) {
  const body = {
    comments: [
      {
        parentCommentId: 0,
        content: comment,
        commentType: 1,
      },
    ],
    status: 1,
    threadContext: {
      filePath: fileName,
    },
  };

  const prUrl = `${tl.getVariable(
    "SYSTEM.TEAMFOUNDATIONCOLLECTIONURI"
  )}${tl.getVariable(
    "SYSTEM.TEAMPROJECTID"
  )}/_apis/git/repositories/${tl.getVariable(
    "Build.Repository.Name"
  )}/pullRequests/${tl.getVariable(
    "System.PullRequest.PullRequestId"
  )}/threads?api-version=5.1`;

  await axios.post(prUrl, JSON.stringify(body), {
    headers: {
      Authorization: `Bearer ${tl.getVariable("SYSTEM.ACCESSTOKEN")}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`New comment added.`);
}
