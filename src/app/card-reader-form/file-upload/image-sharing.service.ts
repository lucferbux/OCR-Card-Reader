import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageSharingService {

  constructor() { }

  imageSelected = new EventEmitter<any>();

  image: File;
}
