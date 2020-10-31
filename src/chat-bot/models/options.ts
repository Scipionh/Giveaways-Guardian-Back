export interface Options {
  options: { debug: boolean },
  connection: {
    secure: boolean,
    reconnect: boolean
  },
  identity: {
    username: string;
    password: string;
  }
  channels: string[];
}