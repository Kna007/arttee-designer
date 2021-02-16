import { Injectable } from '@angular/core';
import firebase from 'firebase';
import 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(){
      // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAOG65tFaSHTZIbf5t82mCTh-ZBrUl4nC0",
    authDomain: "customer-25881.firebaseapp.com",
    databaseURL: "https://customer-25881.firebaseio.com",
    projectId: "customer-25881",
    storageBucket: "customer-25881.appspot.com",
    messagingSenderId: "251047790359",
    appId: "1:251047790359:web:242e39704bfa42275dd952"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  let storageRef = firebase.storage().ref().child('images');
  console.log(storageRef)
  }
  uploadImageToFirebase(image){
    //Create Ref
    let ref = firebase.storage().ref().child('images/abv');
    return ref.put(image)
  }
}
