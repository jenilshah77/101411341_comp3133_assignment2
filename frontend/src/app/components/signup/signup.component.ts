import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-signup',
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
    <div class="signup-container">
      <mat-card class="signup-card">
        <mat-card-header>
          <mat-card-title>Sign Up</mat-card-title>
          <mat-card-subtitle>Create a new account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter username">
              <mat-error *ngIf="username?.invalid && (username?.dirty || username?.touched)">
                {{ getUsernameErrorMessage() }}
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter email">
              <mat-error *ngIf="email?.invalid && (email?.dirty || email?.touched)">
                {{ getEmailErrorMessage() }}
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
              <button mat-raised-button color="primary" type="submit" [disabled]="signupForm.invalid || isSubmitting" class="submit-btn">
                Sign Up
              </button>
              <button mat-stroked-button type="button" routerLink="/login" class="login-btn">
                Already have an account? Login
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .signup-card {
      width: 100%;
      max-width: 400px;
      padding: 24px;
    }

    .signup-form {
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

    .login-btn {
      height: 40px;
    }

    @media (max-width: 600px) {
      .signup-card {
        padding: 16px;
      }
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

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

  getEmailErrorMessage() {
    if (this.email?.hasError('required')) {
      return 'Email is required';
    }
    if (this.email?.hasError('email')) {
      return 'Please enter a valid email address';
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
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      const { username, email, password } = this.signupForm.value;

      this.graphqlService.signup(username, email, password)
        .pipe(
          catchError(error => {
            this.isSubmitting = false;
            console.log('Signup component error:', error.message);
            this.snackBar.open('Username already exists, please try with different username', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            return of(null);
          })
        )
        .subscribe(result => {
          this.isSubmitting = false;
          if (result) {
            this.snackBar.open('Signup successful! Please login.', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/login']);
          }
        });
    }
  }
}
