export const checkUnreachable = (value: never): never => {
  throw new Error(`Unreachable value: ${value}`);
};
