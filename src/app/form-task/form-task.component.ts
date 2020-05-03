import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { take } from 'rxjs/internal/operators/take';

import { TaskService } from '../shared/api/task.service';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { ITask } from '../shared/interfaces/task.interface';
import { ELimitCaracteres } from '../shared/enums/limit-caracteres.enum';

@Component({
  selector: 'app-form-task',
  templateUrl: './form-task.component.html',
  styleUrls: ['./form-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTaskComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  limitCaracteresEnum = ELimitCaracteres;
  isEditMode: boolean;

  constructor(
    private _formBuilder: FormBuilder,
    private _taskService: TaskService,
    private _cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<FormTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: ITask
  ) {
    this.form = _formBuilder.group({
      id: [null],
      title: [null, [Validators.required, Validators.maxLength(ELimitCaracteres.short)]],
      description: [null, [Validators.maxLength(ELimitCaracteres.long)]]
    })
  }

  ngOnInit(): void {
    this.checkModeDialog()
  }

  checkModeDialog(): void {
    if (this.dataDialog) {
      this.isEditMode = true;
      const { id, title, description } = this.dataDialog;
      this.form.setValue({ id, title, description });
    }
  }

  save(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this._taskService.save(this.form.getRawValue())
        .pipe(take(1))
        .subscribe((result: IOperationResult<ITask>) => {
          this.isLoading = false;
          this.dialogRef.close(true);
        }, (error: HttpErrorResponse) => {
          this.isLoading = false;
          this._cdRef.detectChanges();
        })
    } else {

    }
  }

}
