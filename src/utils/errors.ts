export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (error: any, statusCode: number = 500) => {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }

  console.error('Unexpected error:', error);
  return {
    status: statusCode,
    message: 'Internal server error',
  };
};
