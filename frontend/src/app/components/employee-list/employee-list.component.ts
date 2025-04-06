import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { GraphqlService } from '../../services/graphql.service';
import { Employee } from '../../models/employee';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule
  ],
  template: `
    <div class="employee-list-container">
      <div class="header-section">
        <h1 class="page-title">Employee Management</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/employees/add" class="add-button">
            Add Employee
          </button>
        </div>
      </div>

      <div class="filters-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search Employee</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Search Employee" #input>
        </mat-form-field>

        <div class="filter-controls">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="selectedDepartment" (selectionChange)="filterEmployees()">
              <mat-option value="">All Departments</mat-option>
              <mat-option *ngFor="let dept of departments" [value]="dept">{{dept}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Position</mat-label>
            <mat-select [(ngModel)]="selectedPosition" (selectionChange)="filterEmployees()">
              <mat-option value="">All Positions</mat-option>
              <mat-option *ngFor="let pos of positions" [value]="pos">{{pos}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort class="employee-table">
          <ng-container matColumnDef="employee_photo">
            <th mat-header-cell *matHeaderCellDef> Photo </th>
            <td mat-cell *matCellDef="let employee">
              <div class="photo-container">
                <img [src]="employee.employee_photo || 'assets/default-avatar.png'" 
                     alt="Employee photo" 
                     class="employee-photo">
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
            <td mat-cell *matCellDef="let employee">
              <div class="name-cell">
                <span class="employee-name">{{employee.first_name}} {{employee.last_name}}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="designation">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Position </th>
            <td mat-cell *matCellDef="let employee"> 
              <span class="designation-badge">{{employee.designation}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Department </th>
            <td mat-cell *matCellDef="let employee">
              <span class="department-badge">{{employee.department}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let employee">
              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="viewEmployee(employee.id)" class="action-btn view-btn">
                  View
                </button>
                <button mat-raised-button color="accent" (click)="editEmployee(employee.id)" class="action-btn edit-btn">
                  Edit
                </button>
                <button mat-raised-button color="warn" (click)="deleteEmployee(employee)" class="action-btn delete-btn">
                  Delete
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="no-data-row" *matNoDataRow>
            <td class="no-data-cell" colspan="5">
              <div class="no-data-content">
                <mat-icon>search_off</mat-icon>
                <p>No employees found matching your search criteria</p>
              </div>
            </td>
          </tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" 
                      showFirstLastButtons
                      aria-label="Select page of employees">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .employee-list-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .filter-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .table-container {
      overflow-x: auto;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .mat-mdc-table {
      width: 100%;
    }

    .mat-column-photo {
      width: 80px;
      padding-right: 16px;
    }

    .mat-column-name {
      min-width: 200px;
    }

    .mat-column-designation {
      min-width: 150px;
    }

    .mat-column-department {
      min-width: 150px;
    }

    .mat-column-actions {
      width: 280px;
      text-align: right;
      padding-right: 8px;
    }

    .employee-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .designation {
      background: #e3f2fd;
      color: #1976d2;
    }

    .department {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      align-items: center;
    }

    .action-btn {
      min-width: 80px !important;
      height: 32px !important;
      line-height: 32px !important;
      padding: 0 12px !important;
      font-size: 13px;
      font-weight: 500;
      border-radius: 4px;
      color: white !important;
    }

    .view-btn {
      background-color: #1976d2 !important;
    }

    .edit-btn {
      background-color: #f57c00 !important;
    }

    .delete-btn {
      background-color: #d32f2f !important;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    @media (max-width: 1400px) {
      .mat-column-actions {
        width: 420px;
      }

      .action-buttons {
        gap: 16px;
      }

      .action-buttons button {
        min-width: 115px;
      }
    }

    @media (max-width: 1200px) {
      .mat-column-actions {
        width: 380px;
      }

      .action-buttons {
        gap: 12px;
      }

      .action-buttons button {
        min-width: 110px;
        padding: 0 12px;
      }
    }

    @media (max-width: 992px) {
      .mat-column-actions {
        width: 350px;
      }

      .action-buttons {
        gap: 10px;
      }

      .action-buttons button {
        min-width: 105px;
        padding: 0 10px;
        font-size: 13px;
      }
    }

    @media (max-width: 768px) {
      .mat-column-actions {
        width: 260px;
      }

      .action-buttons {
        gap: 8px;
      }

      .action-buttons button {
        min-width: 80px;
        padding: 0 6px;
        font-size: 12px;
      }
    }

    @media (max-width: 600px) {
      .mat-column-photo {
        display: none;
      }

      .mat-column-department {
        display: none;
      }

      .mat-column-actions {
        width: 250px;
        padding-right: 4px;
      }

      .action-buttons {
        gap: 4px;
      }

      .action-btn {
        min-width: 70px !important;
        padding: 0 8px !important;
        font-size: 12px;
      }
    }

    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .employee-name {
      font-weight: 500;
      color: #333;
    }

    .employee-email {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Employee>;

  displayedColumns: string[] = ['employee_photo', 'name', 'designation', 'department', 'actions'];
  dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>();
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  
  selectedDepartment: string = '';
  selectedPosition: string = '';
  departments: string[] = [];
  positions: string[] = [];

  constructor(
    private graphqlService: GraphqlService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.graphqlService.getAllEmployees()
      .pipe(
        catchError(error => {
          this.snackBar.open('Error loading employees: ' + (error.message || 'Unknown error'), 'Dismiss', {
            duration: 5000
          });
          return of([]);
        })
      )
      .subscribe(employees => {
        this.employees = employees;
        this.filteredEmployees = [...employees];
        this.updateFilters();
        this.initializeDataSource();
      });
  }

  updateFilters(): void {
    this.departments = [...new Set(this.employees.map(emp => emp.department))];
    this.positions = [...new Set(this.employees.map(emp => emp.designation))];
  }

  initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredEmployees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.dataSource.filterPredicate = (data: Employee, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.first_name.toLowerCase().includes(searchStr) ||
        data.last_name.toLowerCase().includes(searchStr) ||
        data.email.toLowerCase().includes(searchStr) ||
        data.department.toLowerCase().includes(searchStr) ||
        data.designation.toLowerCase().includes(searchStr)
      );
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterEmployees(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesDepartment = !this.selectedDepartment || employee.department === this.selectedDepartment;
      const matchesPosition = !this.selectedPosition || employee.designation === this.selectedPosition;
      return matchesDepartment && matchesPosition;
    });
    this.dataSource.data = this.filteredEmployees;
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: string): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  deleteEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.graphqlService.deleteEmployee(employee.id!)
          .pipe(
            catchError(error => {
              this.snackBar.open('Error deleting employee: ' + (error.message || 'Unknown error'), 'Dismiss', {
                duration: 5000
              });
              return of(null);
            })
          )
          .subscribe(result => {
            if (result) {
              this.snackBar.open('Employee deleted successfully', 'Dismiss', {
                duration: 3000
              });
              this.loadEmployees();
            }
          });
      }
    });
  }
}
