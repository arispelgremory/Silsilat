export enum Error {
    UNAUTHORIZED = 'Unauthorized',
    FORBIDDEN = 'Forbidden',
    NOT_FOUND = 'Not Found',
    INTERNAL_SERVER_ERROR = 'Internal Server Error',
    BAD_REQUEST = 'Bad Request',
    CONFLICT = 'Conflict',
    UNPROCESSABLE_ENTITY = 'Unprocessable Entity',
    INVALID_CREDENTIALS = 'Invalid Credentials',
    USER_NOT_FOUND = 'User Not Found',
    USER_ALREADY_EXISTS = 'User Already Exists',
    DATABASE_CONNECTION_ERROR = 'Database Connection Error',
    USER_ROLE_ALREADY_EXISTS = 'User Role Already Exists',
    ROLE_PERMISSION_ALREADY_EXISTS = 'Role Permission Already Exists',
    TOKEN_IS_REQUIRED = 'Token is Required'
}