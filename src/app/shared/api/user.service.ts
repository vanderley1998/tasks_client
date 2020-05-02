import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs/internal/Observable';

import { IUserCredentials } from '../interfaces/user-credentials.interface';
import { IOperationResult } from '../interfaces/operation-result.interface';
import { IToken } from '../interfaces/token.interface';
import { IUser } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {

    token: string;

    constructor(
        private _httpClient: HttpClient
    ) { }

    auth(credentials: IUserCredentials): Observable<IOperationResult<IToken>> {
        return this._httpClient.post<IOperationResult<IToken>>(`${environment.apiUrl}/auth`, credentials);
    }

    create(user: IUser): Observable<IOperationResult<IUser>> {
        return this._httpClient.post<IOperationResult<IUser>>(`${environment.apiUrl}/users`, user);
    }
}