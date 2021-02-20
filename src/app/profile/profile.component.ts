import { AfterViewInit, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as Croppie from 'croppie';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  cropped: any;
  profile = {
    profile:null,
    cover:null,
    displayName:null,
    description:null
  }
  isEditingDescription:false;
  constructor(private firebase: FirebaseService, private router: Router) { }
  ngOnInit(): void {
    this.firebase.getDesignerInfo().subscribe(profile=>{
    if(profile !== null){
      this.profile = profile;
      console.log(this.profile)
    }
  })
  }
  changeCoverModal = false;
  changeProfileModal = false;
  croppie;
  hasProfileImg = false;
  hasCoverImg = false;
  @ViewChild('coverImg') coverImg: ElementRef;
  @ViewChild('profileImg') profileImg: ElementRef;
  @ViewChild('crop') crop:ElementRef;
  promptChangeCover(){
    Swal.fire({
      title:'Do you want to change cover image?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Upload Image'
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeCoverModal = true;
        this.coverImg.nativeElement.click();
      }
    })
  }

  changeCoverHandler(coverImg){
    const reader = new FileReader();
    let imageFile = coverImg.files[0];
    reader.addEventListener('load', ()=>{
      
      this.croppie = new Croppie(this.crop.nativeElement,{
        viewport: { width: 200, height: 100 },
        boundary: { width: 300, height: 300 }
      })
      this.croppie.bind({
        url: reader.result
      })
    },false)
    if(imageFile){
      reader.readAsDataURL(imageFile);
    
    }
    this.coverImg.nativeElement.value = '';
  }
  confirmChangeCover(){
    this.croppie.result({
      type:'blob',
      size:'viewport'
    }).then(base64=>{
      this.cropped = base64;
      this.firebase.uploadCover(base64);
    })
  }
  promptChangeProfile(){
    Swal.fire({
      title:'Do you want to change profile image?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Upload Image'
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeProfileModal = true;
        this.profileImg.nativeElement.click();
      }
    })
  }
  uploadDesign(){
    this.router.navigate(['/design']);
  }
  changeProfileHandler(profileImg){
    const reader = new FileReader();
    let imageFile = profileImg.files[0];
    reader.addEventListener('load', ()=>{
      
      this.croppie = new Croppie(this.crop.nativeElement,{
        viewport: { width: 200, height: 200, type:'circle' },
        boundary: { width: 300, height: 300 }
      })
      this.croppie.bind({
        url: reader.result
      })
    },false)
    if(imageFile){
      reader.readAsDataURL(imageFile);
    
    }
    this.profileImg.nativeElement.value = '';
  }
  confirmChangeProfile(){
    this.croppie.result({
      type:'blob',
      size:'viewport'
    }).then(blob=>{
      this.cropped = blob;
      this.firebase.uploadProfile(blob);
    })
  }
  changeDescription(newDescription){
    this.firebase.changeDescription(newDescription)
    .then(a => {this.isEditingDescription = false;
      this.firebase.getDesignerInfo();
    });
  }
  logout(){
    this.firebase.logout();
  }
}
