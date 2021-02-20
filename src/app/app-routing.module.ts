import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DesignComponent} from './design/design.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [{
  path:'design',
  component: DesignComponent
},{
  path:'login',
  component: LoginComponent
},{
  path:'profile',
  component: ProfileComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
