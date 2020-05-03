import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../api/user.service';

@Injectable({ providedIn: 'root' })
export class HttpInterceptorService implements HttpInterceptor {

    constructor(
        private _userService: UserService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this._userService.getToken();
        if (!token)
            return next.handle(req);

        const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(authReq);
    }

}

export const httpInterceptProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
];