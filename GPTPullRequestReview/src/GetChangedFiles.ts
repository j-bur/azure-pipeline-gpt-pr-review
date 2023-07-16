import binaryExtensions from "binary-extensions";
import { getFileExtension } from "./getFileExtension";
import { git } from "./utils/git";

export async function GetChangedFiles(targetBranch: string) {
  await git.addConfig("core.pager", "cat");
  await git.addConfig("core.quotepath", "false");
  await git.fetch();

  const diffs = await git.diff([targetBranch, "--name-only"]);
  const files = diffs.split("\n").filter((line) => line.trim().length > 0);

  // remove binary files
  const nonBinaryFiles = files.filter(
    (file) => !binaryExtensions.includes(getFileExtension(file))
  );

  console.log(
    `Changed Files (excluding binary files) : \n ${nonBinaryFiles.join("\n")}`
  );

  return nonBinaryFiles;
}
