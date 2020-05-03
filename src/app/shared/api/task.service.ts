import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs/internal/Observable';

import { IOperationResult } from '../interfaces/operation-result.interface';
import { ITask } from '../interfaces/task.interface';
import { UserService } from './user.service';
import { IChangeStatusTask } from '../interfaces/change-status-task.interface';

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

    changeStatus(changedStatus: IChangeStatusTask): Observable<IOperationResult<IChangeStatusTask>> {
        return this._httpClient.patch<IOperationResult<IChangeStatusTask>>(`${environment.apiUrl}/tasks/${changedStatus.id}`, changedStatus,
            {
                headers: { 'Authorization': `Bearer ${this._userService.getToken()}` }
            });
    }

    remove(id: number): Observable<IOperationResult<IChangeStatusTask>> {
        return this._httpClient.delete<IOperationResult<IChangeStatusTask>>(`${environment.apiUrl}/tasks/${id}`,
            {
                headers: { 'Authorization': `Bearer ${this._userService.getToken()}` }
            });
    }

    save(task: ITask): Observable<IOperationResult<ITask>> {
        if (task.id)
            return this._httpClient.put<IOperationResult<ITask>>(`${environment.apiUrl}/tasks/${task.id}`, task,
                {
                    headers: { 'Authorization': `Bearer ${this._userService.getToken()}` }
                });
        else
            return this._httpClient.post<IOperationResult<ITask>>(`${environment.apiUrl}/tasks`, task,
                {
                    headers: { 'Authorization': `Bearer ${this._userService.getToken()}` }
                });
    }
}