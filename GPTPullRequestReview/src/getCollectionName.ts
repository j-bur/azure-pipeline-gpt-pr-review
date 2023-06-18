export function getCollectionName(collectionUri: string) {
  const collectionUriWithoutProtocol = collectionUri!
    .replace("https://", "")
    .replace("http://", "");

  if (collectionUriWithoutProtocol.includes(".visualstudio.")) {
    return collectionUriWithoutProtocol.split(".visualstudio.")[0];
  } else {
    return collectionUriWithoutProtocol.split("/")[1];
  }
}
