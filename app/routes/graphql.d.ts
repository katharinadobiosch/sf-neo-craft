declare module '*.graphql' {
  const content: string;
  export default content;
}

declare module '*.graphql?raw' {
  const content: string;
  export default content;
}
