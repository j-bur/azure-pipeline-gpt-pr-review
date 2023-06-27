import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";

const template = `
        Act as a code reviewer of a Pull Request, providing feedback on the code changes below.
          You are provided with the Pull Request changes in a patch format.
          Each patch entry has the commit message in the Subject line followed by the code changes (diffs) in a unidiff format.

          You were also given the source code and the context of the project.
          
          As a code reviewer, your task is:
          - Review only added, edited or deleted lines.
          - Non changed code should not be reviewed
          - If there's no bugs, write 'No feedback'.
          - Use bullet points if you have multiple comments.
          - Keep in mind the wider context of the project.
          
          Patch of the Pull Request to review:
          `;

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(template),
  HumanMessagePromptTemplate.fromTemplate("{patch}"),
]);

export { chatPrompt };
