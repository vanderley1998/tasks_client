import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { take } from 'rxjs/internal/operators/take';

import { TaskService } from '../shared/api/task.service';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { ITask } from '../shared/interfaces/task.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../shared/api/user.service';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTasksComponent implements OnInit {

  displayedColumns: string[] = ['concluded', 'title', 'createDate', 'description', 'options'];
  dataSource = [];

  isLoading = false

  constructor(
    private _snackBar: MatSnackBar,
    private _cdRef: ChangeDetectorRef,
    private _taskService: TaskService,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
    this.getAsync();
  }

  getAsync(): void {
    this._taskService.get()
      .pipe(take(1))
      .subscribe((result: IOperationResult<ITask>) => {
        this.isLoading = false;
        this.dataSource = result.data;
        this._cdRef.detectChanges()
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this._snackBar.open('Não foi possível trazer carregar as tarefas', null, { duration: 5000 })
            this.userService.logout();
            break;
          default:
            this._snackBar.open('Não foi possível listar os tarefas', null, { duration: 5000 })
        }
        this.isLoading = false;
        this._cdRef.detectChanges()
      })
  }

}
