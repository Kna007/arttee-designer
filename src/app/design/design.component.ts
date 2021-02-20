import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fabric } from "fabric";
import { FirebaseService } from '../services/firebase.service';
import { FontServiceService } from '../services/font-service.service';
import Sortable from 'sortablejs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements AfterViewInit {
  @ViewChild('layerList') layerList: ElementRef;
  @ViewChild('teeCanvas') teeCanvas: ElementRef;
  @ViewChild('fabricCanvas') fabricCanvas: ElementRef;
  @ViewChild('canvasesHolder') canvasesHolder: ElementRef;
  @ViewChild('imageInput') imageInput: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef; 
  activeIndex: any;
  isModalOpen = true;
  constructor(private firebaseService: FirebaseService, private fontService: FontServiceService, private route: Router) { 
    this.fontList = this.fontService.fontList;
    
  }
  price = '9.99';
  fabricCtx;
  tshirtColor = 'Black';
  showColorOption =false;
  colors = ["BLACK",'WHITE','NAVY BLUE','GREY'];  
  selectedColor = "BLACK";
  selectedSide = 'front';
  designData = {
    front:{},
    back:{}
  }
  tags = [];
  fontList;
  hasActiveObject;
  hasActiveTextObject;
  textValue = "";
  teeCanvasCtx;
  drawAreaWidth;
  drawAreaHeight;
  sortable;
  sortableOldIndex;
  listOfObjects;
  ngAfterViewInit(): void {
    this.drawAreaWidth = this.canvasesHolder.nativeElement.clientWidth;
    this.drawAreaHeight = this.drawAreaWidth*1.13;
    this.teeCanvas.nativeElement.width = this.drawAreaWidth;
    this.teeCanvas.nativeElement.height = this.drawAreaHeight;
    this.teeCanvasCtx = this.teeCanvas.nativeElement.getContext('2d');
    this.fabricCanvas.nativeElement.width = this.drawAreaWidth/2;
    this.fabricCanvas.nativeElement.height = this.fabricCanvas.nativeElement.width *4/3;
    this.fabricCtx = new fabric.Canvas('fabricCanvas');
    this.fabricCtx.renderAll();
    this.drawTeeImage(this.selectedColor,this.selectedSide);
    this.initializeEvents();
    let layerList = this.layerList.nativeElement;
    this.sortable = new Sortable(layerList,{
      onChange:(e)=>{
        this.swapLayer(e.oldIndex,e.newIndex);
      }
    });
  }
  setOldIndex(index){
    this.sortableOldIndex = index;
  }
  initializeEvents(){
    this.fabricCtx.on("object:added",(event)=>{
      this.updateListOfObjects();
    })
    this.fabricCtx.on("object:removed",(event)=>{
      this.updateListOfObjects();
  
    })
    
    this.fabricCtx.on("selection:created", (event)=>{
     if(this.fabricCtx.getActiveObject().type == 'textbox'){
        this.hasActiveTextObject = true;
      };
      this.updateActiveIndex();
      this.hasActiveObject = true;
      this.fabricCtx.backgroundColor = 'rgba(100,100,100,0.1)';
    })
    this.fabricCtx.on("selection:updated", (event)=>{
      if(this.fabricCtx.getActiveObject().type == 'textbox'){
         this.hasActiveTextObject = true;
       };
       this.updateActiveIndex();
       this.hasActiveObject = true;
       this.fabricCtx.backgroundColor = 'rgba(100,100,100,0.1)';
     })
    this.fabricCtx.on("selection:cleared", (event)=>{
      this.fabricCtx.backgroundColor = 'rgba(0,0,0,0)';
      this.hasActiveObject = false;
      this.hasActiveTextObject = false;
    })
    this.fabricCtx.on("object:moving", (event)=>{
      let snapZone = 10;
      //Middle Horizontal Lock
      var objectMiddle = event.target.left + event.target.getScaledWidth() / 2;
      if (objectMiddle > this.fabricCtx.width / 2 - snapZone &&
        objectMiddle < this.fabricCtx.width / 2 + snapZone) {
        event.target.set({
          left: this.fabricCtx.width / 2 - event.target.getScaledWidth() / 2,
        }).setCoords();
      }
      //Middle vertical lock
      var objectMiddleHeight = event.target.top + event.target.getScaledHeight() / 2;
      if (objectMiddleHeight > this.fabricCtx.height / 2 - snapZone &&
        objectMiddleHeight < this.fabricCtx.height / 2 + snapZone  ) {
        //  console.log('snap Y')
        event.target.set({
          top: this.fabricCtx.height / 2 - event.target.getScaledHeight() / 2,
        }).setCoords();
      }
      //Beginning horizontal lock
      if(event.target.left > -snapZone && event.target.left < snapZone ){
        event.target.set({
          left: 0
        }).setCoords()
       // console.log('horizontal start')
      }
      //Ending horizontal lock
      var objectEndingHorizontal = event.target.left + event.target.getScaledWidth();
      if(objectEndingHorizontal > this.fabricCtx.width-snapZone && objectEndingHorizontal < this.fabricCtx.width + snapZone ){
        event.target.set({
          left: this.fabricCtx.width - event.target.getScaledWidth()
        }).setCoords()
      }
      //Beginning vertical lock
      if(event.target.top > -snapZone && event.target.top < snapZone ){
        event.target.set({
          top: 0
        }).setCoords()
      }
      //Ending vertical lock
      var objectEndingVertical = event.target.top + event.target.getScaledHeight();
      if(objectEndingVertical > this.fabricCtx.height - snapZone && objectEndingVertical < this.fabricCtx.height + snapZone ){
        event.target.set({
          top: this.fabricCtx.height - event.target.getScaledHeight()
        }).setCoords()
      }
    })
  }
  updateActiveIndex(){
    this.activeIndex =  this.fabricCtx.getObjects().indexOf(this.fabricCtx.getActiveObject())
    console.log(this.activeIndex);
  }
  drawTeeImage(color:String, side:String){
    let teeImage = new Image();
    teeImage.src = `/assets/${color.toUpperCase()}-${side.toUpperCase()}.png`;
    teeImage.onload = (event) =>{
      this.teeCanvasCtx.clearRect(0,0,this.drawAreaWidth,this.drawAreaHeight);
      this.teeCanvasCtx.drawImage(teeImage,0,0,this.drawAreaWidth, this.drawAreaHeight);
    }
  }
  processFile(file){
    let imageFile = file.files[0];
    let reader: FileReader = new FileReader();
    reader.addEventListener('load', () => {
      this.firebaseService.uploadImageToFirebase(imageFile).then(a => a.ref.getDownloadURL().then(b=>this.addImage(b)));
    });
    reader.readAsDataURL(imageFile);
    this.imageInput.nativeElement.value = '';
  }
  updateListOfObjects(){
    this.listOfObjects = this.fabricCtx.getObjects();
  }
  setActiveObject(index){
    this.fabricCtx.setActiveObject(this.fabricCtx.item(index));
    this.fabricCtx.renderAll();
  }
  addImage(readResult) {
    fabric.Image.fromURL(readResult, (img) => {
      if (img.width > this.fabricCtx.width) {
        img.set({ left: 100 });
        img.set({ top: 50 });
        img.scaleToWidth(150, false);
        img.scaleToHeight(150, false);
      }
      this.fabricCtx.add(img);
      this.fabricCtx.setActiveObject(img);
      this.fabricCtx.renderAll().setActiveObject(img);
    })
  }
  uploadImage(){
    this.imageInput.nativeElement.click();
  }
  preventDeselect(event){
    event.stopPropagation();
  }
  selectColor(color){
    this.selectedColor = color;
    this.showColorOption = false;
    this.drawTeeImage(this.selectedColor,this.selectedSide)
  }
  addText(){
    var textbox = new fabric.Textbox('Enter Your Text Here', {
      left: this.fabricCtx.width/2,
      top: this.fabricCtx.height/2,
      fill:'white',
      fontSize: 20
    });
    this.textValue = textbox.text;
    textbox.on('changed',(e)=>{
      this.textValue = textbox.text;
    })
    this.fabricCtx.add(textbox).setActiveObject(textbox);
  }
  changeTextStyling(style){
    let activeText = this.fabricCtx.getActiveObject();
    switch (style){
      case 'bold':
        activeText.fontWeight=="bold" ?activeText.set({fontWeight:'400'}) : activeText.set({fontWeight:'bold'});
        break;
      case 'italic':
        activeText.fontStyle=="italic" ?activeText.set({fontStyle:''}) : activeText.set({fontStyle:'italic'});
        break;
      case 'underline':
        activeText.underline?activeText.set({underline:false}):activeText.set({underline:true})
    }
    this.fabricCtx.renderAll();
  }
  changeText(event){
    this.fabricCtx.getActiveObject().set({text:event.target.value});
    this.fabricCtx.renderAll();
  }
  changeTextColor(event){
    this.fabricCtx.getActiveObject().set({fill:event.target.value});
    this.fabricCtx.renderAll();
  }
  changeFontSize(event){
    this.fabricCtx.getActiveObject().set({fontSize:event.target.value});
    this.fabricCtx.renderAll();
  }
  save(){
    this.deselect('');
    var json = this.fabricCtx.toJSON();
    if(this.selectedSide == 'front'){
      this.designData.front = json;
    }else{
      this.designData.back = json;
    }
    
  }
  deselect(event){
    if (event) {
      event.stopPropagation();
    }
    this.fabricCtx.discardActiveObject().renderAll();
  }
  swapLayer(oldIndex,newIndex){
    let object = this.fabricCtx.getObjects();
    console.log(object, oldIndex,newIndex);
    object[oldIndex].moveTo(newIndex);
  }
  crop(){

  }
  delete() {
    this.fabricCtx.remove(this.fabricCtx.getActiveObject());
    this.fabricCtx.renderAll();
  }
  flipSide(){
    this.save();
    this.fabricCtx.clear();
    this.selectedSide == 'front' ? this.selectedSide = 'back' : this.selectedSide = 'front';
    if(this.selectedSide =='front'){
      if (!this.designData.front) return;
      this.fabricCtx.loadFromJSON(this.designData.front, this.fabricCtx.renderAll.bind(this.fabricCtx));
    }
    if(this.selectedSide =='back'){
      if (!this.designData.back) return;
      this.fabricCtx.loadFromJSON(this.designData.back, this.fabricCtx.renderAll.bind(this.fabricCtx));
    }
    this.drawTeeImage(this.selectedColor, this.selectedSide)
  }
  saveDesign(){
    let json = this.fabricCtx.toJSON();
    this.fabricCtx.clear();
    this.fabricCtx.loadFromJSON(json);
  }
  routeTo(route){
    this.route.navigate([`/${route}`])
  }
  processInput(text){
    let commaIndex = text.indexOf(',');
    if(commaIndex!=='0' && commaIndex != '-1'){

      let tag = text.slice(0,commaIndex);
      text = text.slice(commaIndex+1, text.length);
      this.tags.push(tag);
      this.tagInput.nativeElement.value = text;
    }
  }
  removeTag(index){
    this.tags.splice(index,1);
  }
}
