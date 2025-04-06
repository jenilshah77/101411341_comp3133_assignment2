import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { EmployeeDetailComponent } from './components/employee-detail/employee-detail.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'employees', 
    component: EmployeeListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employees/add', 
    component: AddEmployeeComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employees/:id', 
    component: EmployeeDetailComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employees/:id/edit', 
    component: EditEmployeeComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
