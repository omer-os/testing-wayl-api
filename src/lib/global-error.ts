class ApiError extends Error {
  status: number;
  constructor(public message: string, status?: number) {
    super(message);
    this.status = status ?? 418;
  }
  toResponse() {
    return Response.json(
      {
        error: this.message,
        code: this.status,
      },
      {
        status: this.status,
      }
    );
  }
}
export default ApiError;
