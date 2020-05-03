import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs/internal/Observable';

import { IOperationResult } from '../interfaces/operation-result.interface';
import { ITask } from '../interfaces/task.interface';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class TaskService {

    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) { }

    get(): Observable<IOperationResult<ITask>> {
        return this._httpClient.get<IOperationResult<ITask>>(`${environment.apiUrl}/tasks`, {
            headers: {
                'Authorization': `Bearer ${this._userService.getToken()}`
            }
        });
    }
}