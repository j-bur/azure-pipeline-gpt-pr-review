import * as tl from "azure-pipelines-task-lib/task";
import binaryExtensions from "binary-extensions";
import * as glob from "glob";
import { TextLoader } from "langchain/document_loaders";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { getFileExtension } from "./getFileExtension";

export const LoadProjectContext = async (directory: string) => {
  const files = glob.globSync(`${directory}/**/*`, {
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
  const docs = docsArray.reduce((acc, val) => acc.concat(val), []);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: tl.getInput("apiKey", true) as string,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  return vectorStore.asRetriever();
};
