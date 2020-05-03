import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';

import { take } from 'rxjs/internal/operators/take';

import { TaskService } from '../shared/api/task.service';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { ITask } from '../shared/interfaces/task.interface';
import { UserService } from '../shared/api/user.service';
import { IChangeStatusTask } from '../shared/interfaces/change-status-task.interface';
import { FormTaskComponent } from '../form-task/form-task.component';
import { FormUserComponent } from '../form-user/form-user.component';

@Component({
  selector: 'app-list-tasks',
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTasksComponent implements OnInit {

  displayedColumns: string[] = ['concluded', 'title', 'createDate', 'description', 'options'];
  dataSource: ITask[] = [];

  isLoading = false

  constructor(
    private _snackBar: MatSnackBar,
    private _cdRef: ChangeDetectorRef,
    private _taskService: TaskService,
    private _dialog: MatDialog,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    this.init();
    this.getAsync();
  }

  async init(): Promise<void> {
    if (!this.userService.currentUser)
      await this.userService.getCurrentUser();
  }

  getAsync(): void {
    this.isLoading = true;
    this._taskService.get()
      .pipe(take(1))
      .subscribe((result: IOperationResult<ITask>) => {
        this.isLoading = false;
        this.dataSource = result.data;
        this._cdRef.detectChanges()
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this._snackBar.open('Você tem que se autenticar primeiro', null, { duration: 5000 })
            this.userService.logout();
            break;
          default:
            this._snackBar.open('Não foi possível listar os tarefas', null, { duration: 5000 })
        }
        this.isLoading = false;
        this._cdRef.detectChanges()
      })
  }

  changeStatusAsync(event: MatCheckboxChange, task: ITask): void {
    this.isLoading = true;
    const changedStatus = ({} as IChangeStatusTask);
    changedStatus.id = task.id;
    changedStatus.concluded = event.checked;

    this._taskService.changeStatus(changedStatus)
      .pipe(take(1))
      .subscribe(() => {
        this.isLoading = false;
        this.updateLocalList(changedStatus.concluded, task);
        const snack = this._snackBar.open('Status da tarefa alterado com sucesso', 'DESFAZER', { duration: 2000 })
        snack.onAction()
          .pipe(take(1))
          .subscribe(() => {
            event.checked = !event.checked;
            this.changeStatusAsync(event, task);
          });
        this._cdRef.detectChanges()
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this._snackBar.open('Você tem que se autenticar primeiro', null, { duration: 5000 })
            this.userService.logout();
            break;
          default:
            this._snackBar.open('Não foi possível mudar o status da tarefa', null, { duration: 5000 })
            this.updateLocalList(!task.concluded, task);
            this._cdRef.detectChanges();
        }
        this.isLoading = false;
        this._cdRef.detectChanges()
      })
  }

  removeAsync(task: ITask): void {
    this.isLoading = true;
    this._taskService.remove(task.id)
      .pipe(take(1))
      .subscribe(() => {
        this.isLoading = false;
        this.removeTaskLocalList(task);
        this._snackBar.open('Tarefa removida com sucesso', null, { duration: 2000 })
        this._cdRef.detectChanges();
      }, (error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this._snackBar.open('Você tem que se autenticar primeiro', null, { duration: 5000 })
            this.userService.logout();
            break;
          default:
            this._snackBar.open('Não foi possível listar os tarefas', null, { duration: 5000 })
        }
        this.isLoading = false;
        this._cdRef.detectChanges()
      })
  }

  updateLocalList(newStatus: boolean, task: ITask): void {
    const index = this.dataSource.findIndex(t => t.id === task.id);
    if (index > -1) {
      this.dataSource[index].concluded = newStatus;
    }
  }

  removeTaskLocalList(task: ITask): void {
    const index = this.dataSource.findIndex(t => t.id === task.id);
    if (index > -1) {
      this.dataSource.splice(index, 1);
      this.dataSource = [...this.dataSource];
    }
  }

  openFormTaskDialog(task?: ITask): void {
    const dialogRef = this._dialog.open(FormTaskComponent, {
      width: '50%',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.getAsync();
    });
  }

  openFormUserDialog(): void {
    const dialogRef = this._dialog.open(FormUserComponent, {
      width: '50%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.userService.logout();
      else
        this._cdRef.detectChanges();
    });
  }
}
