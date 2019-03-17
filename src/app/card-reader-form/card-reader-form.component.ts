import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FileUploadComponent } from './file-upload/file-upload.component';


@Component({
  selector: 'app-card-reader-form',
  templateUrl: './card-reader-form.component.html',
  styleUrls: ['./card-reader-form.component.scss']
})
export class CardReaderFormComponent implements OnInit {
  @ViewChild(FileUploadComponent)
  fileUpload: FileUploadComponent;

  folderName = "cardImage";
  fileName = "card_image";
  titleDropdown = "Image Upload";
  subtitleDropdown = "Choose a photo to upload...";
  imageTitleDropdown = "Image processed";
  imageSubtitleDropdown = "Image processed to extract data";
  url: string = "nothing";
  
  searchForm: FormGroup;
  loading = false;
  editable: Boolean =  true;

  constructor() { 
  }

  ngOnInit() {
    
  }



}
