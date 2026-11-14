export const docsBase = '/developers';

// Keep authoring links and translation hashes stable while moving public URLs.
export function publicDocumentationUrl(url:string) {
  return url.replace(/^\/docs(?=\/|$|[?#])/, docsBase)
    .replace(/^\/(llms(?:-full)?\.txt)(?=$|[?#])/, `${docsBase}/$1`);
}

export function publicMarkdown(body:string) {
  return body.replace(/(\]\()(\/docs(?=[/)?#])[^\s)]*|\/llms(?:-full)?\.txt)(?=[\s)])/g,
    (_, prefix, url) => prefix + publicDocumentationUrl(url));
}
