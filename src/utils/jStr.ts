const jStr = (input: object, prettify: boolean = false): string => {
  if ( prettify ) return JSON.stringify(input, null, 2);
  return JSON.stringify(input);
}

export default jStr;
