import { SimpleGitOptions, simpleGit } from "simple-git";
import * as tl from "azure-pipelines-task-lib/task";

const gitOptions: Partial<SimpleGitOptions> = {
  baseDir: `${tl.getVariable("System.DefaultWorkingDirectory")}`,
  binary: "git",
};

const git = simpleGit(gitOptions);

export { git };
