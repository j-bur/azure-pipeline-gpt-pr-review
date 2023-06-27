import * as tl from "azure-pipelines-task-lib/task";
import { SimpleGitOptions, simpleGit } from "simple-git";

const gitOptions: Partial<SimpleGitOptions> = {
  baseDir: `${tl.getVariable("System.DefaultWorkingDirectory")}`,
  binary: "git",
};

const git = simpleGit(gitOptions);

export { git };
