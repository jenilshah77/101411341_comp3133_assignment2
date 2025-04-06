import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Enter your credentials</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter username">
              <mat-error *ngIf="username?.invalid && (username?.dirty || username?.touched)">
                {{ getUsernameErrorMessage() }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Enter password">
              <mat-error *ngIf="password?.invalid && (password?.dirty || password?.touched)">
                {{ getPasswordErrorMessage() }}
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || isSubmitting" class="submit-btn">
                Login
              </button>
              <button mat-stroked-button type="button" routerLink="/signup" class="signup-btn">
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .submit-btn {
      height: 40px;
    }

    .signup-btn {
      height: 40px;
    }

    @media (max-width: 600px) {
      .login-card {
        padding: 16px;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  getUsernameErrorMessage() {
    if (this.username?.hasError('required')) {
      return 'Username is required';
    }
    if (this.username?.hasError('minlength')) {
      return 'Username must be at least 3 characters long';
    }
    if (this.username?.hasError('maxlength')) {
      return 'Username cannot exceed 20 characters';
    }
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password?.hasError('required')) {
      return 'Password is required';
    }
    if (this.password?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      const { username, password } = this.loginForm.value;

      this.graphqlService.login(username, password)
        .pipe(
          catchError(error => {
            this.isSubmitting = false;
            this.snackBar.open('Invalid credentials, Please try again!', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            return of(null);
          })
        )
        .subscribe(result => {
          this.isSubmitting = false;
          if (result) {
            this.authService.setAuth(result.token, result.user);
            
            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/employees']);
          }
        });
    }
  }
}
