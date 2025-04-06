import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">👥</div>
            <h1 class="app-title">Employee Management System</h1>
          </div>
          <div class="auth-info" *ngIf="isAuthenticated">
            <div class="user-welcome">
              <span class="welcome-text">Welcome back,</span>
              <span class="username">
                <span class="user-icon">👤</span>
                {{ currentUser?.username }}
              </span>
            </div>
            <button class="logout-btn" (click)="onLogout()">
              <span class="logout-icon">🔒</span>
              <span class="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main class="app-main">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
      <footer class="app-footer">
        <div class="footer-content">
          <p>© 2024 Employee Management System</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    }

    .app-header {
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
      animation: bounce 2s infinite;
    }

    .app-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      background: linear-gradient(to right, #ffffff, #e3f2fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .auth-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-welcome {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .welcome-text {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .username {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
    }

    .user-icon {
      font-size: 1.2rem;
      animation: pulse 2s infinite;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .logout-icon {
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .logout-btn:hover .logout-icon {
      transform: rotate(180deg);
    }

    .app-main {
      flex: 1;
      padding: 2rem;
      background-color: #f8f9fa;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      min-height: calc(100vh - 200px);
      transition: transform 0.3s ease;
    }

    .content-wrapper:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .app-footer {
      background: linear-gradient(135deg, #1565c0, #1976d2);
      color: white;
      padding: 1.5rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .auth-info {
        width: 100%;
        justify-content: space-between;
      }

      .app-main {
        padding: 1rem;
      }

      .content-wrapper {
        min-height: calc(100vh - 250px);
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
