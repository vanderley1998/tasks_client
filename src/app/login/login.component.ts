import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { take } from 'rxjs/internal/operators/take';

import { UserService } from '../shared/api/user.service';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { IToken } from '../shared/interfaces/token.interface';
import { IUser } from '../shared/interfaces/user.interface';
import { Router } from '@angular/router';
import { ELimitCaracteres } from '../shared/enums/limit-caracteres.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  form: FormGroup
  isLoading = false;
  isCreatingMode = false;

  limitCaracteresEnum = ELimitCaracteres;

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _snackBar: MatSnackBar,
    private _cdRef: ChangeDetectorRef,
    private _router: Router
  ) {
    this.form = _formBuilder.group({
      login: [null, [Validators.required, Validators.maxLength(ELimitCaracteres.login)]],
      name: [null],
      password: [null, [Validators.required]]
    })
  }

  authenticate(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.isCreatingMode ? this.createUserAsync() : this.loginAsync()
    }
    else {
      this._snackBar.open('Verifique os campos e tente novamente', null, { duration: 5000 })
    }

  }

  loginAsync(): void {
    const { login, password } = this.form.getRawValue();
    this._userService.auth({ login, password })
      .pipe(take(1))
      .subscribe((result: IOperationResult<IToken>) => {
        this.isLoading = false;
        this._userService.saveToken(result.data[0].token);
        this._router.navigate(['list-tasks']);
        this._cdRef.detectChanges();
      }, (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 401)
          this._snackBar.open('Login ou senha incorretos', null, { duration: 5000 })
        this._cdRef.detectChanges();
      })
  }

  createUserAsync(): void {
    this._userService.create(this.form.getRawValue())
      .pipe(take(1))
      .subscribe((result: IOperationResult<IUser>) => {
        this.isLoading = false;
        this.loginAsync();
        this._cdRef.detectChanges();
      }, (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 400)
          this._snackBar.open('Nem todos os campos foram preenchidos corretamente', null, { duration: 5000 })
        if (error.status === 401)
          this._snackBar.open('Login ou senha incorretos', null, { duration: 5000 })
        if (error.status === 409)
          this._snackBar.open(`Já existe um usuário com o login "${this.form.get('login').value}"`, null, { duration: 5000 })
        this._cdRef.detectChanges();
      })
  }

  switchFormMode(): void {
    this.isCreatingMode = !this.isCreatingMode;
    if (this.isCreatingMode)
      this.form.get('name').setValidators([Validators.required, Validators.maxLength(ELimitCaracteres.short)])
    else
      this.form.get('name').setValidators([Validators.maxLength(ELimitCaracteres.short)])
    this._cdRef.detectChanges();
  }
}
