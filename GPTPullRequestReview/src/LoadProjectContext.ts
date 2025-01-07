// import * as tl from "azure-pipelines-task-lib/task";
import { tl } from './utils/tl';
import binaryExtensions from "binary-extensions";
import * as glob from "glob";
import { TextLoader } from "langchain/document_loaders/fs/text"; 
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { getFileExtension } from "./getFileExtension";
import path from "path";

export const LoadProjectContext = async (directory: string) => {
  const pathToRecurse = path.join(directory, "**", "*");

  const files = glob.globSync(pathToRecurse, {
    nodir: true,
  });

  const nonBinaryFiles = files.filter(
    (file) => !binaryExtensions.includes(getFileExtension(file))
  );

  console.log(
    `Project Files (excluding binary files) : \n ${nonBinaryFiles.join("\n")}`
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    separators: ["\n", ";", ","],
  });

  const loaders = nonBinaryFiles.map((file) => {
    return new TextLoader(file);
  });

  const docsArray = await Promise.all(
    loaders.map(async (loader) => {
      return loader.loadAndSplit(splitter);
    })
  );

  // flatten docs
  const docs = docsArray.reduce((acc: any[], val: any) => acc.concat(val), []);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: tl.getInput("apiKey", true) as string,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  return vectorStore.asRetriever();
};
