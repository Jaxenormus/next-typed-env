import * as chalk from "chalk";

const prefixes = {
  wait: "- " + chalk.cyan("wait"),
  error: "- " + chalk.red("error"),
  event: "- " + chalk.magenta("event"),
  // warn: "- " + chalk.yellow("warn"),
  // ready: "- " + chalk.green("ready"),
  // info: "- " + chalk.cyan("info"),
  // trace: "- " + chalk.magenta("trace"),
};

export function wait(...message: any[]) {
  console.log(prefixes.wait, ...message);
}

export function error(...message: any[]) {
  console.error(prefixes.error, ...message);
}

export function event(...message: any[]) {
  console.log(prefixes.event, ...message);
}
