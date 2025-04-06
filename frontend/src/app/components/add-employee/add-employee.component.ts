import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="add-employee-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Add Employee</mat-card-title>
          <mat-card-subtitle>Create a new employee record</mat-card-subtitle>
          <div class="header-actions">
            <button mat-icon-button color="primary" routerLink="/employees">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" placeholder="Enter first name">
                <mat-error *ngIf="employeeForm.get('first_name')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" placeholder="Enter last name">
                <mat-error *ngIf="employeeForm.get('last_name')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter email">
                <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
                <mat-error *ngIf="employeeForm.get('gender')?.hasError('required')">
                  Gender is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Position</mat-label>
                <input matInput formControlName="designation" placeholder="Enter position">
                <mat-error *ngIf="employeeForm.get('designation')?.hasError('required')">
                  Position is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <input matInput formControlName="department" placeholder="Enter department">
                <mat-error *ngIf="employeeForm.get('department')?.hasError('required')">
                  Department is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Salary</mat-label>
                <input matInput type="number" formControlName="salary" placeholder="Enter salary">
                <mat-error *ngIf="employeeForm.get('salary')?.hasError('required')">
                  Salary is required
                </mat-error>
                <mat-error *ngIf="employeeForm.get('salary')?.hasError('min')">
                  Salary must be greater than 0
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date of Joining</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date_of_joining">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="employeeForm.get('date_of_joining')?.hasError('required')">
                  Date of joining is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <div class="photo-upload-section">
                <label class="photo-label">Profile Photo</label>
                <div class="photo-upload-container">
                  <div class="photo-preview" *ngIf="previewUrl">
                    <img [src]="previewUrl" alt="Employee photo preview">
                    <button mat-icon-button color="warn" class="remove-photo" (click)="removePhoto()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="upload-button" *ngIf="!previewUrl">
                    <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
                    <button mat-raised-button type="button" (click)="fileInput.click()" class="upload-btn">
                      Upload Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Add Employee</span>
              </button>
              <button mat-button type="button" (click)="cancel()">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .add-employee-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .mat-card {
      margin-top: 20px;
    }

    .header-actions {
      margin-left: auto;
    }

    .employee-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .mat-form-field {
      flex: 1;
    }

    .photo-upload-section {
      width: 100%;
    }

    .photo-label {
      display: block;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
    }

    .photo-upload-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .photo-preview {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #e0e0e0;
    }

    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-photo {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
    }

    .upload-button {
      display: flex;
      align-items: center;
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }

      .add-employee-container {
        padding: 0 16px;
      }
    }
  `]
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  isLoading = false;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      department: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(0)]],
      date_of_joining: ['', [Validators.required]],
      employee_photo: ['']
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.employeeForm.patchValue({
          employee_photo: this.previewUrl
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.previewUrl = null;
    this.employeeForm.patchValue({
      employee_photo: ''
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = this.employeeForm.value;
    
    if (formData.date_of_joining instanceof Date) {
      formData.date_of_joining = formData.date_of_joining.toISOString().split('T')[0];
    }

    this.graphqlService.addEmployee(formData)
      .pipe(
        catchError(error => {
          this.snackBar.open('Error adding employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(result => {
        if (result) {
          this.snackBar.open('Employee added successfully', 'Dismiss', {
            duration: 3000
          });
          this.router.navigate(['/employees']);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
} 