import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs/internal/Observable';

import { IUserCredentials } from '../interfaces/user-credentials.interface';
import { IOperationResult } from '../interfaces/operation-result.interface';
import { IToken } from '../interfaces/token.interface';
import { IUser } from '../interfaces/user.interface';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserService {

    currentUser: IUser;

    constructor(
        private _router: Router,
        private _httpClient: HttpClient
    ) { }

    auth(credentials: IUserCredentials): Observable<IOperationResult<IToken>> {
        return this._httpClient.post<IOperationResult<IToken>>(`${environment.apiUrl}/auth`, credentials);
    }

    create(user: IUser): Observable<IOperationResult<IUser>> {
        return this._httpClient.post<IOperationResult<IUser>>(`${environment.apiUrl}/users`, user);
    }

    saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string {
        return localStorage.getItem('token');
    }

    cleanToken(): void {
        localStorage.removeItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        this._router.navigate(['login']);
    }
}