import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoggingin = true;
  constructor(private firebase: FirebaseService) { }
  ngOnInit(): void {
  }
  signup(email,password, username, description){
    this.firebase.signup(email,password, username, description)
  }
  login(email,password){
    this.firebase.login(email,password)
  }
  logout(){
    this.firebase.logout();
  }
}
