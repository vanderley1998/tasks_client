import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { take } from 'rxjs/operators/'

import { UserService } from '../shared/api/user.service';
import { IOperationResult } from '../shared/interfaces/operation-result.interface';
import { IUserCredentials } from '../shared/interfaces/user-credentials.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { IToken } from '../shared/interfaces/token.interface';
import { IUser } from '../shared/interfaces/user.interface';

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

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    this.form = _formBuilder.group({
      login: [null, [Validators.required]],
      name: [null],
      password: [null, [Validators.required]]
    })
  }

  authenticate(): void {
    console.log(this.form)
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
        this._userService.token = result.data[0].token;
        this.cdRef.detectChanges();
      }, (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 401)
          this._snackBar.open('Login ou senha incorretos', null, { duration: 5000 })
        this.cdRef.detectChanges();
      })
  }

  createUserAsync(): void {
    this._userService.create(this.form.getRawValue())
      .pipe(take(1))
      .subscribe((result: IOperationResult<IUser>) => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }, (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 400)
          this._snackBar.open('Nem todos os campos foram preenchidos corretamente', null, { duration: 5000 })
        if (error.status === 401)
          this._snackBar.open('Login ou senha incorretos', null, { duration: 5000 })
        this.cdRef.detectChanges();
      })
  }

  switchFormMode(): void {
    this.isCreatingMode = !this.isCreatingMode;
    if (this.isCreatingMode)
      this.form.get('name').setValidators([Validators.required])
    else
      this.form.get('name').setValidators([])
    this.cdRef.detectChanges();
  }
}
