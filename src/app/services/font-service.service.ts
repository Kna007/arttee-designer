import { Injectable } from '@angular/core';
import FontFaceObserver from 'fontfaceobserver';
@Injectable({
  providedIn: 'root'
})
export class FontServiceService {
  fontList =  ["Pacifico", "VT323", "Quicksand", "Inconsolata"];
  fontFaceObserver;
  constructor() {
    this.fontFaceObserver = new FontFaceObserver();
   }
}
