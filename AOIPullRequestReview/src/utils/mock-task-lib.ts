/**
 * Gets a variable value that is defined on the build/release definition or set at runtime.
 *
 * @param     name     name of the variable to get
 * @returns   string
 */
export const getVariable = (name: string): any => {
    const re = /\./gi;
    const result = name.replace(re, "_");
    return process.env?.[result];
  };
  
  /**
   * Sets the result of the task.
   * Execution will continue.
   * If not set, task will be Succeeded.
   * If multiple calls are made to setResult the most pessimistic call wins (Failed) regardless of the order of calls.
   *
   * @param result    TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
   * @param message   A message which will be logged as an error issue if the result is Failed.
   * @param done      Optional. Instructs the agent the task is done. This is helpful when child processes
   *                  may still be running and prevent node from fully exiting. This argument is supported
   *                  from agent version 2.142.0 or higher (otherwise will no-op).
   * @returns         void
   */
  export const setResult = (result: any, message: string) => {
    console.log(`Mocked setResult; result: ${result} message: ${message}`);
  };
  
  
  /**
   * Gets the value of an input and converts to a bool.  Convenience.
   * If required is true and the value is not set, it will throw.
   * If required is false and the value is not set, returns false.
   *
   * @param     name     name of the bool input to get
   * @param     required whether input is required.  optional, defaults to false
   * @returns   boolean
   */
  export const getBoolInput = (name: string, required?: boolean): boolean => {
    console.log(`Mocked getBoolInput; name: ${name} required: ${required}`);
    return !!process.env?.[name];
  };
  
  /**
   * Gets the value of an input.
   * If required is true and the value is not set, it will throw.
   *
   * @param     name     name of the input to get
   * @param     required whether input is required.  optional, defaults to false
   * @returns   string
   */
  export const getInput = (input: string): string | undefined => {
    return process.env?.[input]; 
  };
  
  export const debug = (message: string) => {
    console.log(`##vso[task.debug]${message}`);
  };
  
  export const TaskResult = {
    Succeeded: 0,
    Failed: 1,
    SucceededWithIssues: 2,
    Skipped: 3,
    Canceled: 4
  };