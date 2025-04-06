import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="edit-employee-container">
      <mat-card class="edit-card">
        <mat-card-header>
          <mat-card-title>Edit Employee</mat-card-title>
          <mat-card-subtitle>Update employee information</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="photo-section">
            <div class="photo-preview" *ngIf="employee?.employee_photo">
              <img [src]="employee.employee_photo" alt="Employee photo">
            </div>
            <div class="photo-upload">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
              <button mat-stroked-button type="button" (click)="fileInput.click()" class="photo-btn">
                Change Photo
              </button>
            </div>
          </div>

          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" placeholder="Enter first name">
                <mat-error *ngIf="employeeForm.get('first_name')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" placeholder="Enter last name">
                <mat-error *ngIf="employeeForm.get('last_name')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="Enter email">
                <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
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
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Salary</mat-label>
                <input matInput type="number" formControlName="salary" placeholder="Enter salary">
                <mat-error *ngIf="employeeForm.get('salary')?.hasError('required')">
                  Salary is required
                </mat-error>
                <mat-error *ngIf="employeeForm.get('salary')?.hasError('min')">
                  Salary must be at least 0
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Date of Joining</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date_of_joining" placeholder="Select date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="employeeForm.get('date_of_joining')?.hasError('required')">
                  Date of joining is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Position</mat-label>
                <input matInput formControlName="designation" placeholder="Enter position">
                <mat-error *ngIf="employeeForm.get('designation')?.hasError('required')">
                  Position is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Department</mat-label>
                <input matInput formControlName="department" placeholder="Enter department">
                <mat-error *ngIf="employeeForm.get('department')?.hasError('required')">
                  Department is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/employees" class="cancel-btn">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid || isSubmitting" class="submit-btn">
                Save Changes
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .edit-employee-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .edit-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .edit-card mat-card-header {
      padding: 24px 24px 0;
      background: #f5f5f5;
      border-radius: 12px 12px 0 0;
    }

    .edit-card mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .edit-card mat-card-subtitle {
      color: #666;
      font-size: 14px;
    }

    .edit-card mat-card-content {
      padding: 24px;
    }

    .employee-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-row {
      display: flex;
      gap: 24px;
    }

    .form-field {
      flex: 1;
    }

    .form-field ::ng-deep .mat-form-field-wrapper {
      margin: 0;
      padding: 0;
    }

    .form-field ::ng-deep .mat-form-field-outline {
      background: #f5f5f5;
      border-radius: 8px;
    }

    .form-field ::ng-deep .mat-form-field-outline-thick {
      color: #1976d2;
    }

    .form-field ::ng-deep .mat-form-field-label {
      color: #666;
    }

    .form-field ::ng-deep .mat-input-element {
      color: #333;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .submit-btn {
      background-color: #1976d2 !important;
      color: white !important;
      min-width: 160px;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .submit-btn:hover {
      background-color: #1565c0 !important;
    }

    .cancel-btn {
      min-width: 120px;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #e0e0e0;
    }

    .cancel-btn:hover {
      background-color: #f5f5f5;
    }

    .submit-btn mat-icon,
    .cancel-btn mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column;
        gap: 12px;
      }

      .submit-btn,
      .cancel-btn {
        width: 100%;
      }
    }

    .photo-section {
      margin-bottom: 24px;
      text-align: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .photo-preview {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-upload {
      text-align: center;
    }

    .photo-btn {
      min-width: 120px;
    }
  `]
})
export class EditEmployeeComponent implements OnInit {
  employeeId!: string;
  employeeForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  employee: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'];
    this.initForm();
    this.loadEmployee();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      date_of_joining: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required]
    });
  }

  loadEmployee(): void {
    this.isLoading = true;
    this.graphqlService.getEmployeeById(this.employeeId)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          this.snackBar.open('Error loading employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
            duration: 5000
          });
          return of(null);
        })
      )
      .subscribe(employee => {
        if (employee) {
          this.employee = employee;
          this.employeeForm.patchValue({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            gender: employee.gender,
            salary: employee.salary,
            date_of_joining: new Date(employee.date_of_joining),
            designation: employee.designation,
            department: employee.department
          });
        }
      });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.isSubmitting = true;
      const formData = {
        ...this.employeeForm.value
      };
      
      if (formData.date_of_joining instanceof Date) {
        formData.date_of_joining = formData.date_of_joining.toISOString().split('T')[0];
      }

      if (typeof formData.salary === 'string') {
        formData.salary = parseFloat(formData.salary);
      }
      
      this.graphqlService.updateEmployee(this.employeeId, formData)
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (result) => {
            if (result) {
              this.snackBar.open('Employee updated successfully', 'Dismiss', {
                duration: 3000
              });
              this.router.navigate(['/employees']);
            }
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            this.snackBar.open('Error updating employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
              duration: 5000
            });
          }
        });
    }
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      if (file.size > 5000000) {
        this.snackBar.open('File is too large. Please select an image under 5MB.', 'Dismiss', {
          duration: 5000
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file.', 'Dismiss', {
          duration: 5000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        
        this.isSubmitting = true;
        this.graphqlService.updateEmployee(this.employeeId, {
          employee_photo: base64String
        })
        .pipe(
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (result) => {
            if (result) {
              this.employee = result;
              this.snackBar.open('Photo updated successfully', 'Dismiss', {
                duration: 3000
              });
            }
          },
          error: (error) => {
            console.error('Error updating photo:', error);
            this.snackBar.open('Error updating photo: ' + (error.message || 'Unknown error'), 'Dismiss', {
              duration: 5000
            });
          }
        });
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        this.snackBar.open('Error reading file. Please try again.', 'Dismiss', {
          duration: 5000
        });
      };
      reader.readAsDataURL(file);
    }
  }
} 