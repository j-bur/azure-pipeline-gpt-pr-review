import { SimpleGitOptions, SimpleGit, simpleGit } from 'simple-git';
// import * as tl from "azure-pipelines-task-lib/task";
import { tl } from './utils/tl';
import binaryExtensions from 'binary-extensions';
import { getFileExtension } from './utils';

let DefaultWorkingDirectory = tl.getVariable("System.DefaultWorkingDirectory");

function removeLastInstance(str: string | undefined, toRemove: string) {
  if (!str) return;

  const lastIndex = str.lastIndexOf(toRemove);

  if (lastIndex === -1) {
    return str;
  }

  return str.slice(0, lastIndex) + str.slice(lastIndex + toRemove.length);
}

if (tl.getVariable('IS_LOCAL_TEST') === 'true') {
  console.info('Running locally!')
  DefaultWorkingDirectory = removeLastInstance(process.env.INIT_CWD, '\\AOIPullRequestReview')
}

const gitOptions: Partial<SimpleGitOptions> = {
  baseDir: DefaultWorkingDirectory,
  binary: 'git'
};

export const git: SimpleGit = simpleGit(gitOptions);

export async function getChangedFiles(targetBranch: string) {
  await git.addConfig('core.pager', 'cat');
  await git.addConfig('core.quotepath', 'false');
  await git.fetch();

  const diffs = await git.diff([targetBranch, '--name-only', '--diff-filter=AM']);
  const files = diffs.split('\n').filter(line => line.trim().length > 0);
  const nonBinaryFiles = files.filter(file => !binaryExtensions.includes(getFileExtension(file)));

  console.log(`Changed Files (excluding binary files) : \n ${nonBinaryFiles.join('\n')}`);

  return nonBinaryFiles;
}