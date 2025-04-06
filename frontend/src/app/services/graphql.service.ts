import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee';

// GraphQL Queries and Mutations
const GET_ALL_EMPLOYEES = gql`
  query GetAllEmployees {
    getAllEmployees {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const GET_EMPLOYEE_BY_ID = gql`
  query GetEmployeeById($id: ID!) {
    searchEmployeeById(id: $id) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const SEARCH_EMPLOYEES = gql`
  query SearchEmployees($designation: String, $department: String) {
    searchEmployeeByDesignationOrDepartment(designation: $designation, department: $department) {
      id
      first_name
      last_name
      email
      gender
      designation
      salary
      date_of_joining
      department
      employee_photo
    }
  }
`;

const ADD_EMPLOYEE = gql`
  mutation AddEmployee(
    $first_name: String!,
    $last_name: String!,
    $email: String!,
    $gender: String!,
    $designation: String!,
    $salary: Float!,
    $date_of_joining: String!,
    $department: String!,
    $employee_photo: String
  ) {
    addEmployee(
      first_name: $first_name,
      last_name: $last_name,
      email: $email,
      gender: $gender,
      designation: $designation,
      salary: $salary,
      date_of_joining: $date_of_joining,
      department: $department,
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      email
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee(
    $id: ID!,
    $first_name: String,
    $last_name: String,
    $email: String,
    $gender: String,
    $designation: String,
    $salary: Float,
    $date_of_joining: String,
    $department: String,
    $employee_photo: String
  ) {
    updateEmployee(
      id: $id,
      first_name: $first_name,
      last_name: $last_name,
      email: $email,
      gender: $gender,
      designation: $designation,
      salary: $salary,
      date_of_joining: $date_of_joining,
      department: $department,
      employee_photo: $employee_photo
    ) {
      id
      first_name
      last_name
      email
      gender
      salary
      designation
      department
      date_of_joining
      employee_photo
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  constructor(private apollo: Apollo) { }

  refetchEmployees(): void {
    this.apollo.client.refetchQueries({
      include: [GET_ALL_EMPLOYEES]
    });
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.apollo.watchQuery<{ getAllEmployees: Employee[] }>({
      query: GET_ALL_EMPLOYEES
    })
    .valueChanges
    .pipe(
      map(result => result.data.getAllEmployees)
    );
  }

  getEmployeeById(id: string): Observable<Employee | null> {
    return this.apollo.query<{ searchEmployeeById: Employee }>({
      query: GET_EMPLOYEE_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only'
    })
    .pipe(
      map(result => {
        if (!result.data || !result.data.searchEmployeeById) {
          throw new Error('Employee not found');
        }
        return result.data.searchEmployeeById;
      })
    );
  }

  searchEmployees(criteria: { designation?: string, department?: string }): Observable<Employee[]> {
    return this.apollo.watchQuery<{ searchEmployeeByDesignationOrDepartment: Employee[] }>({
      query: SEARCH_EMPLOYEES,
      variables: criteria
    })
    .valueChanges
    .pipe(
      map(result => result.data.searchEmployeeByDesignationOrDepartment)
    );
  }

  addEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Observable<Employee> {
    return this.apollo.mutate<{ addEmployee: Employee }>({
      mutation: ADD_EMPLOYEE,
      variables: employee,
      refetchQueries: [{ query: GET_ALL_EMPLOYEES }]
    })
    .pipe(
      map(result => result.data!.addEmployee)
    );
  }

  updateEmployee(id: string, employeeData: any): Observable<Employee | null> {
    // Format the date if it's a Date object
    if (employeeData.date_of_joining instanceof Date) {
      employeeData.date_of_joining = employeeData.date_of_joining.toISOString().split('T')[0];
    }

    // Convert salary to float if it's a string
    if (typeof employeeData.salary === 'string') {
      employeeData.salary = parseFloat(employeeData.salary);
    }

    // Clean up undefined values
    Object.keys(employeeData).forEach(key => {
      if (employeeData[key] === undefined) {
        delete employeeData[key];
      }
    });

    return this.apollo.mutate<any>({
      mutation: UPDATE_EMPLOYEE,
      variables: { id, ...employeeData },
      refetchQueries: [{ query: GET_ALL_EMPLOYEES }],
      fetchPolicy: 'no-cache'
    }).pipe(
      map(result => {
        if (!result.data?.updateEmployee) {
          throw new Error('Failed to update employee');
        }
        return result.data.updateEmployee;
      })
    );
  }

  deleteEmployee(id: string): Observable<string> {
    return this.apollo.mutate<{ deleteEmployee: string }>({
      mutation: DELETE_EMPLOYEE,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_EMPLOYEES }]
    })
    .pipe(
      map(result => result.data!.deleteEmployee)
    );
  }

  signup(username: string, email: string, password: string): Observable<any> {
    const mutation = gql`
      mutation Signup($username: String!, $email: String!, $password: String!) {
        signup(username: $username, email: $email, password: $password) {
          token
          user {
            id
            username
            email
          }
        }
      }
    `;

    return this.apollo.mutate({
      mutation,
      variables: {
        username,
        email,
        password
      }
    }).pipe(
      map((result: any) => {
        if (result.errors) {
          console.log('Signup error:', result.errors[0].message);
          throw new Error(result.errors[0].message);
        }
        return result.data.signup;
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    const query = gql`
      query Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          user {
            id
            username
            email
          }
        }
      }
    `;

    return this.apollo.watchQuery({
      query,
      variables: {
        username,
        password
      }
    }).valueChanges.pipe(
      map((result: any) => {
        if (result.errors) {
          const error = result.errors[0];
          throw new Error('Invalid credentials');
        }
        return result.data.login;
      })
    );
  }
}
