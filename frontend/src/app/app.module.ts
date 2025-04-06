import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    // ... your declarations
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink, authService: AuthService) => {
        const headers = new HttpHeaders();
        if (authService.token) {
          headers.set('Authorization', `Bearer ${authService.token}`);
        }

        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'http://localhost:4000/graphql',
            headers
          })
        };
      },
      deps: [HttpLink, AuthService]
    }
  ],
  bootstrap: [/* your root component */]
})
export class AppModule { } 