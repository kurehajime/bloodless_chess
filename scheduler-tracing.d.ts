declare module 'scheduler/tracing' {
  export type Interaction = unknown;
  export function unstable_clear<T>(callback: () => T): T;
  export function unstable_getCurrent<T = Interaction[]>(): T;
  export function unstable_trace<T>(
    name: string,
    timestamp: number,
    callback: () => T,
    threadID?: number
  ): T;
  export function unstable_wrap<TArgs extends unknown[], TResult>(
    callback: (...args: TArgs) => TResult
  ): (...args: TArgs) => TResult;
}
