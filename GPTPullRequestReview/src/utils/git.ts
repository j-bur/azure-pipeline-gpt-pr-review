import { SimpleGitOptions, simpleGit } from "simple-git";
import { tl } from './tl';

let DefaultWorkingDirectory = tl.getVariable("System.DefaultWorkingDirectory");
// eslint-disable-next-line prefer-const
let binaryPath = 'git';

function removeLastInstance(str: string | undefined, toRemove: string) {
  if (!str) return;

  const lastIndex = str.lastIndexOf(toRemove);

  if (lastIndex === -1) {
    return str;
  }

  return str.slice(0, lastIndex) + str.slice(lastIndex + toRemove.length);
}

if (process?.env?.IS_LOCAL_TEST === 'true') {
  console.info('Running locally!')
  DefaultWorkingDirectory = removeLastInstance(process.env.INIT_CWD, '\\GPTPullRequestReview')
  // binaryPath = tl.getVariable("GIT_PATH");
}

const gitOptions: Partial<SimpleGitOptions> = {
  baseDir: DefaultWorkingDirectory,
  binary: binaryPath,
};

console.log("gitOptions")
console.log(gitOptions)

const git = simpleGit(gitOptions);

export { git };

// console.info('process.env:')
// console.log(process.env)
// console.log("process.cwd()")
// console.log(process.cwd())