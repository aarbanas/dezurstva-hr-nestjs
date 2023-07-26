export class MissingCertificateError extends Error {
  constructor() {
    super('Missing certificate');
  }
}
