export interface IOperationResult<T> {
    data: T[],
    statusCode: number,
    errorMessage: string,
    totalRows: number
}