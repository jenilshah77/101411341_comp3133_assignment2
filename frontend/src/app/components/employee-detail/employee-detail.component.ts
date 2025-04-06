import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GraphqlService } from '../../services/graphql.service';
import { Employee } from '../../models/employee';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="employee-detail-container">
      <div *ngIf="isLoading" class="loading-spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading employee details...</p>
      </div>

      <mat-card *ngIf="!isLoading && employee" class="employee-card">
        <mat-card-header>
          <mat-card-title>Employee Details</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="employee-info">
            <div class="info-section">
              <div class="info-group">
                <h3>Personal Information</h3>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">First Name</span>
                    <span class="info-value">{{employee.first_name}}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Last Name</span>
                    <span class="info-value">{{employee.last_name}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{employee.email}}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Gender</span>
                    <span class="info-value">{{employee.gender}}</span>
                  </div>
                </div>
              </div>

              <div class="info-group">
                <h3>Employment Information</h3>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">Position</span>
                    <span class="info-value status-badge">{{employee.designation}}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Department</span>
                    <span class="info-value status-badge purple">{{employee.department}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">Salary</span>
                    <span class="info-value salary">{{employee.salary | currency:'USD':'symbol':'1.0-0'}}/year</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Join Date</span>
                    <span class="info-value">{{employee.date_of_joining | date:'mediumDate'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-stroked-button routerLink="/employees">Back to List</button>
          <button mat-raised-button color="primary" [routerLink]="['/employees', employee.id, 'edit']">Edit Employee</button>
        </mat-card-actions>
      </mat-card>

      <div *ngIf="!isLoading && !employee" class="error-container">
        <mat-card>
          <mat-card-content class="error-content">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h2>Employee Not Found</h2>
            <p>The requested employee profile could not be found.</p>
            <button mat-raised-button color="primary" routerLink="/employees">Back to List</button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .employee-detail-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 1rem;
    }

    .loading-spinner-container p {
      color: #666;
      font-size: 1rem;
    }

    .employee-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      padding: 1.5rem 1.5rem 0;
      border-bottom: 1px solid #eee;
    }

    mat-card-title {
      font-size: 1.5rem !important;
      font-weight: 500 !important;
      color: #2c3e50;
      margin-bottom: 1.5rem !important;
    }

    mat-card-content {
      padding: 1.5rem;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-group {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-group h3 {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e9ecef;
    }

    .info-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-label {
      font-size: 0.875rem;
      color: #6c757d;
      font-weight: 500;
    }

    .info-value {
      font-size: 1rem;
      color: #2c3e50;
    }

    .status-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 500;
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-badge.purple {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .salary {
      color: #2e7d32;
      font-weight: 500;
    }

    mat-card-actions {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid #eee;
    }

    .error-container {
      max-width: 500px;
      margin: 2rem auto;
    }

    .error-content {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .error-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #f44336;
      margin-bottom: 1rem;
    }

    .error-content h2 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }

    .error-content p {
      color: #6c757d;
      margin: 0 0 1.5rem 0;
    }

    @media (max-width: 768px) {
      .info-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-group {
        padding: 1rem;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }

      .employee-detail-container {
        margin: 1rem auto;
      }
    }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  isLoading = false;
  
  constructor(
    private route: ActivatedRoute,
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string): void {
    this.isLoading = true;
    this.graphqlService.getEmployeeById(id)
      .pipe(
        catchError(error => {
          this.snackBar.open(error.message || 'Error loading employee', 'Dismiss', {
            duration: 5000
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (employee) => {
          this.employee = employee;
          if (!employee) {
            this.snackBar.open('Employee not found', 'Dismiss', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          console.error('Error loading employee:', error);
          this.snackBar.open('Error loading employee details', 'Dismiss', {
            duration: 5000
          });
        }
      });
  }
} 