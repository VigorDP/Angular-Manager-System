import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injector, Injectable, Inject } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate, CanActivateChild {
  constructor(private injector: Injector, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {}
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.logIn();
  }
  canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
    return this.logIn();
  }
  private logIn() {
    const token = this.tokenService.get().token;
    if (!token) {
      this.goTo(this.tokenService.login_url);
      return false;
    }
    return true;
  }
  private goTo(url: string) {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }
}
