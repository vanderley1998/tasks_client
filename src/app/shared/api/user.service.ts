import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs/internal/Observable';

import { IUserCredentials } from '../interfaces/user-credentials.interface';
import { IOperationResult } from '../interfaces/operation-result.interface';
import { IToken } from '../interfaces/token.interface';
import { IUser } from '../interfaces/user.interface';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UserService {

    currentUser: IUser;

    constructor(
        private _router: Router,
        private _httpClient: HttpClient,
        private _snackBar: MatSnackBar
    ) { }

    auth(credentials: IUserCredentials): Observable<IOperationResult<IToken>> {
        return this._httpClient.post<IOperationResult<IToken>>(`${environment.apiUrl}/auth`, credentials);
    }

    async getCurrentUser(): Promise<void> {
        await this._httpClient.get<IOperationResult<IUser>>(`${environment.apiUrl}/users/session`).toPromise()
            .then((result) => {
                this.currentUser = result.data[0];
                return result;
            })
            .catch(() => {
                this._snackBar.open('Não foi possível recuperar os dados do usuário', null, { duration: 5000 });
                this.logout();
            })
    }

    create(user: IUser): Observable<IOperationResult<IUser>> {
        return this._httpClient.post<IOperationResult<IUser>>(`${environment.apiUrl}/users`, user);
    }

    saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string {
        const token = localStorage.getItem('token');
        if (!token) {
            this.logout();
            return;
        }
        return token;
    }

    cleanToken(): void {
        localStorage.removeItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        this._router.navigate(['login']);
    }
}