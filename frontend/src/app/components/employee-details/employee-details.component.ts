import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GraphqlService } from '../../services/graphql.service';
import { Employee } from '../../models/employee';
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
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
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
    <div class="container">
      <mat-card>
        <mat-card-header>
          <div class="header-content">
            <div class="employee-photo" *ngIf="employee?.employee_photo">
              <img [src]="employee.employee_photo" alt="Employee photo">
            </div>
            <div class="header-text">
              <mat-card-title>{{ editMode ? 'Edit Employee' : 'Employee Details' }}</mat-card-title>
              <mat-card-subtitle *ngIf="employee">
                {{ employee.first_name }} {{ employee.last_name }}
              </mat-card-subtitle>
            </div>
            <div class="header-actions">
              <button mat-icon-button color="primary" routerLink="/employees">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="loading-shade" *ngIf="isLoading">
            <mat-spinner></mat-spinner>
          </div>

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
              <div class="photo-upload">
                <label>Profile Photo</label>
                <div class="photo-preview-container">
                  <div class="photo-preview" *ngIf="employee?.employee_photo">
                    <img [src]="employee.employee_photo" alt="Employee photo">
                  </div>
                  <div class="photo-upload-btn" *ngIf="editMode">
                    <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
                    <button mat-raised-button type="button" (click)="fileInput.click()">
                      <mat-icon>cloud_upload</mat-icon>
                      Change Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <ng-container *ngIf="!editMode">
                <button mat-raised-button color="primary" type="button" (click)="toggleEditMode()">
                  Edit Employee
                </button>
              </ng-container>
              
              <ng-container *ngIf="editMode">
                <button mat-raised-button color="primary" type="submit" [disabled]="employeeForm.invalid || isLoading">
                  <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                  <span *ngIf="!isLoading">Save Changes</span>
                </button>
                <button mat-button type="button" (click)="cancelEdit()">
                  Cancel
                </button>
              </ng-container>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .mat-card {
      margin-top: 20px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    .employee-photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #1976d2;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .header-text {
      flex: 1;
    }

    .header-actions {
      margin-left: auto;
    }

    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
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
      
      @media (max-width: 600px) {
        flex-direction: column;
      }
    }

    .mat-form-field {
      flex: 1;
    }

    .photo-upload {
      width: 100%;
    }

    .photo-preview-container {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }

    .photo-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
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
  `]
})
export class EmployeeDetailsComponent implements OnInit {
  employeeForm!: FormGroup;
  employee: Employee | null = null;
  employeeId: string = '';
  isLoading = false;
  editMode = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.employeeId = this.route.snapshot.params['id'];
    this.loadEmployee();
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
    this.employeeForm.disable();
  }

  loadEmployee(): void {
    if (!this.employeeId) return;

    this.isLoading = true;
    this.graphqlService.getEmployeeById(this.employeeId)
      .pipe(
        catchError(error => {
          this.snackBar.open('Error loading employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(employee => {
        if (employee) {
          this.employee = employee;
          this.employeeForm.patchValue({
            ...employee,
            date_of_joining: new Date(employee.date_of_joining)
          });
        }
      });
  }

  toggleEditMode(): void {
    this.editMode = true;
    this.employeeForm.enable();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.employeeForm.disable();
    if (this.employee) {
      this.employeeForm.patchValue({
        ...this.employee,
        date_of_joining: new Date(this.employee.date_of_joining)
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const photoUrl = reader.result as string;
        this.employee = { ...this.employee!, employee_photo: photoUrl };
        this.employeeForm.patchValue({
          employee_photo: photoUrl
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.employeeForm.invalid || !this.employeeId) {
      return;
    }

    this.isLoading = true;
    const formData = this.employeeForm.value;
    
    // Format the date
    if (formData.date_of_joining instanceof Date) {
      formData.date_of_joining = formData.date_of_joining.toISOString().split('T')[0];
    }

    this.graphqlService.updateEmployee(this.employeeId, formData)
      .pipe(
        catchError(error => {
          this.snackBar.open('Error updating employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(result => {
        if (result) {
          this.employee = result;
          this.editMode = false;
          this.employeeForm.disable();
          this.snackBar.open('Employee updated successfully', 'Dismiss', {
            duration: 3000
          });
        }
      });
  }
}
