import { Injectable } from '@angular/core';
import firebase from 'firebase';
import Swal from 'sweetalert2';
import 'firebase/storage';
import 'firebase/firestore';
import { uid } from 'uid';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  auth;
  storage;
  swal;
  db;
  uid = new BehaviorSubject(null);
  profile = new BehaviorSubject(null);
  currentUser;
  constructor(private router: Router){

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
  this.storage= firebase.storage();
  this.auth = firebase.auth();  
  this.db = firebase.firestore();
    this.auth.onAuthStateChanged(user=>{
      this.uid.next(user.uid);
    })

  }
  uploadImageToFirebase(image){
    //Create Ref
    let ref = firebase.storage().ref().child(`images/${uid(32)}`);
    return ref.put(image)
  }
  signup(email,password, username, description){
    this.auth.createUserWithEmailAndPassword(email,password)
    .then(user => {
      console.log(user);
      this.db.collection('designer').doc(user.user.uid).set({
        created: new Date().toISOString(),
        displayName: username,
        description: description
      }).then(()=>{
        Swal.close();
        this.router.navigate(['/profile']);
      })
    })
    .catch(e => this.errorAlert(e.message))
  }
  login(email,password){
    this.loadingAlert();
    this.auth.signInWithEmailAndPassword(email,password)
    .then(user=>{
      Swal.close();
      this.router.navigate(['/profile']);
    })
    .catch(e => this.errorAlert(e.message))
  }
  loadingAlert(){
    Swal.fire({
      title:'Loading',
      allowOutsideClick:false
    })
    Swal.showLoading();
  }
  errorAlert(message){
    Swal.fire({
      title:message
    })
  }
  logout(){
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }
  getDesignerInfo():any{
    this.uid.subscribe(uid=>{
      if(uid !== null){
        console.log(uid);
        this.db.collection('designer').doc(uid).get().then(userData => this.profile.next(userData.data()));
      }
    });
    return this.profile;
  }
  uploadCover(img){
    let storageRef = firebase.storage().ref().child(`cover/${this.uid.getValue()}`);
    let currentUser = this.db.collection('designer').doc(this.uid.getValue());
    storageRef.put(img).then((snapshot)=>{
      snapshot.ref.getDownloadURL().then(url=>{
        currentUser.update({
          cover:url
        })
      }).then(a=>this.getDesignerInfo()).catch(a=>console.error('Error in uploading document'))

    })
  }
  uploadProfile(img){
    let storageRef = firebase.storage().ref().child(`profile/${this.uid.getValue()}`);
    let currentUser = this.db.collection('designer').doc(this.uid.getValue());
    storageRef.put(img).then((snapshot)=>{
      snapshot.ref.getDownloadURL().then(url=>{
        currentUser.update({
          profile:url
        }).then(a=>this.getDesignerInfo()).catch(a=>console.error('Error in uploading document'))
      })
    }).catch(e => console.log(e))
  }
  changeDescription(newDescription){
    let currentUser = this.db.collection('designer').doc(this.uid.getValue());
    return currentUser.update({
      description: newDescription
    })
  }
}
