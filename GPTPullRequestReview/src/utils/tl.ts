const isLocalTest = process?.env?.IS_LOCAL_TEST === "true";
// import { getBoolInput } from "azure-pipelines-task-lib";
import { getBoolInput, getInput, getVariable, setResult, TaskResult } from "./mock-task-lib";

export let tl: any;

if (isLocalTest) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require("path");
  const thisFile = __filename;
  const mockLibPath = path.join(path.dirname(thisFile), "..", "mock-task-lib");

  tl = require(mockLibPath);
  tl.getBoolInput = getBoolInput;
  tl.getInput = getInput;
  tl.getVariable = getVariable;
  tl.setResult = setResult;
  tl.TaskResult = TaskResult;
} else {
  tl = require("azure-pipelines-task-lib/task");
}
