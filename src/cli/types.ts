export type Status = 'pending' | 'success' | 'failure';

export type Task = {
  name: string,
  status?: Status,
  message?: React.ReactNode,
  title?: React.ReactNode,
}

export type Options = {
  force?: boolean;
  prefix?: string;
  branch?: string;
  ignoreSpecs: Array<string>;
}
