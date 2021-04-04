export class LoggerService {
  #prefix: string;

  constructor(prefix: string) {
    this.#prefix = prefix;
  }

  log(message: string) {
    console.log(this.#prefix, message);
    return true;
  }

  error(message: string) {
    console.error(this.#prefix, message);
    return true;
  }

  warn(message: string) {
    console.warn(this.#prefix, message);
    return true;
  }

  info(message: string) {
    console.info(this.#prefix, message);
    return true;
  }
}
