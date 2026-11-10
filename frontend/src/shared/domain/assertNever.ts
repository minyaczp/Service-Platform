/** Exhaustiveness guard for a closed union: a new variant fails to compile until handled. */
export function assertNever(x: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(x)}`);
}
