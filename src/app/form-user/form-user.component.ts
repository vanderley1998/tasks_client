import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { take } from 'rxjs/internal/operators/take';

import { ELimitCaracteres } from '../shared/enums/limit-caracteres.enum';
import { UserService } from '../shared/api/user.service';
import { IUser } from '../shared/interfaces/user.interface';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-form-user',
  templateUrl: './form-user.component.html',
  styleUrls: ['./form-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormUserComponent implements OnInit {

  limitCaracteresEnum = ELimitCaracteres;
  form: FormGroup;
  isLoading = false;

  constructor(
    private _snackBar: MatSnackBar,
    private _firmBuilder: FormBuilder,
    private _userService: UserService,
    private _cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<FormUserComponent>
  ) {
    this.form = this._firmBuilder.group({
      id: [null],
      login: [null, [Validators.required, Validators.maxLength(ELimitCaracteres.login)]],
      name: [null, [Validators.required, Validators.maxLength(ELimitCaracteres.short)]],
      password: [null]
    });
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    if (this._userService.currentUser) {
      this.form.setValue({ ...this._userService.currentUser, password: '' });
      this._cdRef.detectChanges();
      return;
    }
    this._userService.logout();
  }

  saveAsync(): void {
    if (this.form.valid) {
      this.isLoading = true;
      const user = this.form.getRawValue() as IUser;
      this._userService.save(user)
        .pipe(take(1))
        .subscribe((result: IOperationResult<IUser>) => {
          this._snackBar.open('Dados do usuário alterados com sucesso', null, { duration: 2000 })
          this._userService.currentUser.name = user.name;
          this._userService.currentUser.login = user.login;
          this.dialogRef.close();
        }, (error: HttpErrorResponse) => {
          console.log(error);
          this.isLoading = false;
          this._cdRef.detectChanges();
          this._snackBar.open('Erro ao salvar dados do usuário', null, { duration: 5000 })
        })
    }
  }

  removeAsync(): void {
    this.isLoading = true;
    const user = this.form.getRawValue() as IUser;
    this._userService.remove(user)
      .pipe(take(1))
      .subscribe((result: IOperationResult<IUser>) => {
        this._snackBar.open('Usuário removido com sucesso', null, { duration: 2000 })
        this.dialogRef.close(true);
      }, (error: HttpErrorResponse) => {
        console.log(error);
        this.isLoading = false;
        this._cdRef.detectChanges();
        this._snackBar.open('Erro ao remover usuário', null, { duration: 5000 })
      })
  }

}
