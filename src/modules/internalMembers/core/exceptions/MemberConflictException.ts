export class MemberConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberConflictException";
  }
}
