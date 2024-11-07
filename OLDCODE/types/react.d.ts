import 'react'

declare module 'react' {
  interface FunctionComponent<P = Record<string, unknown>> {
    (props: P, context?: unknown): React.ReactElement | null;
  }
} 