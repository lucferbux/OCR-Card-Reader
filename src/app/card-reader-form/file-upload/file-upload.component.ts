import { Component, OnInit, Input, Output, EventEmitter, forwardRef, ViewChild, Inject } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { ImageSharingService } from './image-sharing.service'
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';

export interface ResultOCR {
  description: string[];
}

export interface ResultNameSuggestion {
  possible_name: string[];
  name: string;
  phone: string;
  email: string;
  username: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})

export class FileUploadComponent implements ControlValueAccessor {
  //ControlValueAccesor framework to forms
  // https://angularfirebase.com/lessons/firebase-storage-with-angularfire-dropzone-file-uploader/
  // Main task 
  task: AngularFireUploadTask;
  @Input() folder: string = "test";
  @Input() filename: string = "name_upload";
  @Input() title: string = "Upload File";
  @Input() subtitle: string = "Choose a file to upload";
  @Input() imageTitle: string = "Imagen de avatar";
  @Input() imageSubtitle: string = "Imagen que se mostrará en el avatar del perfil";
  @Input() widthCrop: number = 100;
  @Input() heightCrop: number = 100;
  @Input() avatarImage = true;
  // Progress monitoring
  percentage: Observable<number>;
  snapshot: Observable<any>;

  downloadURL: Observable<string>;

  result$: Observable<any>;

  results_filtered: ResultNameSuggestion;

  // State for dropzone CSS toggling
  isHovering: boolean;
  url: string = '';

  REGEX_TWITTER = new RegExp('^^@[a-zA-Z._]{1,21}$');
  REGEX_MAIL = new RegExp('^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');
  REGEX_PHONE_NUMBER = new RegExp('^[\+]?([0-9]{2,3}|[0-9]{6,13})$');
  REGEX_POSSIBLE_NAMES = new RegExp('^[a-zA-ZZñÑáéíóúÁÉÍÓÚ]{3,21}$');
  POSSIBLE_NAMES: string[] = [
    "ANTONIO", "JOSE", "MANUEL", "FRANCISCO", "DAVID", "JUAN", "JOSE ANTONIO", "JAVIER", "JOSE LUIS", "DANIEL", "FRANCISCO JAVIER", "JESUS", "CARLOS", "ALEJANDRO", "MIGUEL", "JOSE MANUEL", "RAFAEL", "PEDRO", "MIGUEL ANGEL", "ANGEL", "PABLO", "JOSE MARIA", "FERNANDO", "SERGIO", "LUIS", "JORGE", "ALBERTO", "JUAN CARLOS", "ALVARO", "JUAN JOSE", "DIEGO", "ADRIAN", "RAUL", "JUAN ANTONIO", "IVAN", "ENRIQUE", "RUBEN", "RAMON", "VICENTE", "OSCAR", "ANDRES", "JOAQUIN", "JUAN MANUEL", "SANTIAGO", "EDUARDO", "VICTOR", "MARIO", "ROBERTO", "JAIME", "FRANCISCO JOSE", "IGNACIO", "MARCOS", "ALFONSO", "JORDI", "SALVADOR", "RICARDO", "EMILIO", "HUGO", "GUILLERMO", "GABRIEL", "JULIAN", "JULIO", "MARC", "TOMAS", "JOSE MIGUEL", "GONZALO", "AGUSTIN", "MOHAMED", "JOSE RAMON", "FELIX", "NICOLAS", "JOAN", "MARTIN", "ISMAEL", "CRISTIAN", "SAMUEL", "AITOR", "JUAN FRANCISCO", "JOSEP", "HECTOR", "MARIANO", "DOMINGO", "JOSE CARLOS", "ALFREDO", "SEBASTIAN", "IKER", "CESAR", "FELIPE", "ALEX", "LUCAS", "JOSE ANGEL", "JOSE IGNACIO", "VICTOR MANUEL", "LUIS MIGUEL", "RODRIGO", "GREGORIO", "JOSE FRANCISCO", "JUAN LUIS", "XAVIER", "ALBERT",
    "JOSE", "ANTONIO", "JUAN", "MANUEL", "FRANCISCO", "LUIS", "JAVIER", "MIGUEL", "ANGEL", "CARLOS", "JESUS", "DAVID", "PEDRO", "DANIEL", "ALEJANDRO", "MARIA", "RAFAEL", "ALBERTO", "FERNANDO", "PABLO", "RAMON", "JORGE", "SERGIO", "ENRIQUE", "VICENTE", "ANDRES", "DIEGO", "VICTOR", "IGNACIO", "ADRIAN", "ALVARO", "RAUL", "EDUARDO", "IVAN", "JOAQUIN", "OSCAR", "RUBEN", "SANTIAGO", "ROBERTO", "MARIO", "ALFONSO", "GABRIEL", "JAIME", "RICARDO", "MARCOS", "EMILIO", "JULIO", "SALVADOR", "GUILLERMO", "TOMAS", "JULIAN", "HUGO", "JORDI", "AGUSTIN", "FELIX", "MARTIN", "JOSEP", "NICOLAS", "GONZALO", "MOHAMED", "CRISTIAN", "JOAN", "CESAR", "MARC", "DOMINGO", "SEBASTIAN", "FELIPE", "ALFREDO", "SAMUEL", "ISMAEL", "MARIANO", "HECTOR", "AITOR", "LUCAS", "ALEX", "XAVIER", "RODRIGO", "ESTEBAN", "IKER", "GREGORIO", "LORENZO", "ARTURO", "EUGENIO", "ALEXANDER", "MARCO", "CRISTOBAL", "ALBERT", "BORJA", "VALENTIN", "MATEO", "ADOLFO", "GERMAN", "AARON", "JONATHAN", "ISAAC", "JOEL", "CHRISTIAN", "DARIO", "ERNESTO", "PAU",
    "MARIA CARMEN", "MARIA", "CARMEN", "JOSEFA", "ANA MARIA", "ISABEL", "MARIA PILAR", "MARIA DOLORES", "LAURA", "MARIA TERESA", "ANA", "CRISTINA", "MARIA ANGELES", "MARTA", "FRANCISCA", "ANTONIA", "MARIA ISABEL", "MARIA JOSE", "DOLORES", "LUCIA", "SARA", "PAULA", "MARIA LUISA", "ELENA", "PILAR", "CONCEPCION", "RAQUEL", "ROSA MARIA", "MANUELA", "MERCEDES", "MARIA JESUS", "ROSARIO", "BEATRIZ", "JUANA", "TERESA", "JULIA", "NURIA", "SILVIA", "ENCARNACION", "IRENE", "ALBA", "PATRICIA", "MONTSERRAT", "ANDREA", "ROSA", "ROCIO", "MONICA", "MARIA MAR", "ALICIA", "ANGELA", "SONIA", "SANDRA", "MARINA", "SUSANA", "YOLANDA", "NATALIA", "MARGARITA", "MARIA JOSEFA", "MARIA ROSARIO", "EVA", "INMACULADA", "CLAUDIA", "MARIA MERCEDES", "ANA ISABEL", "ESTHER", "NOELIA", "CARLA", "VERONICA", "SOFIA", "ANGELES", "CAROLINA", "NEREA", "MARIA VICTORIA", "MARIA ROSA", "EVA MARIA", "AMPARO", "MIRIAM", "LORENA", "INES", "MARIA CONCEPCION", "ANA BELEN", "MARIA ELENA", "VICTORIA", "MARIA ANTONIA", "DANIELA", "CATALINA", "CONSUELO", "LIDIA", "MARIA NIEVES", "CELIA", "ALEJANDRA", "OLGA", "EMILIA", "GLORIA", "LUISA", "AINHOA", "AURORA", "MARIA SOLEDAD", "MARTINA", "FATIMA",
    "MARIA", "CARMEN", "ANA", "ISABEL", "DOLORES", "PILAR", "TERESA", "JOSEFA", "ROSA", "CRISTINA", "ANGELES", "ANTONIA", "LAURA", "ELENA", "FRANCISCA", "MARTA", "MERCEDES", "LUCIA", "LUISA", "CONCEPCION", "ROSARIO", "JOSE", "PAULA", "SARA", "JUANA", "RAQUEL", "MANUELA", "EVA", "JESUS", "BEATRIZ", "ROCIO", "PATRICIA", "VICTORIA", "JULIA", "BELEN", "ENCARNACION", "ANDREA", "SILVIA", "ESTHER", "NURIA", "ALBA", "MONTSERRAT", "IRENE", "ANGELA", "INMACULADA", "MONICA", "SANDRA", "YOLANDA", "ALICIA", "SONIA", "MAR", "MARGARITA", "MARINA", "SUSANA", "NATALIA", "CLAUDIA", "AMPARO", "NIEVES", "GLORIA", "INES", "CAROLINA", "SOFIA", "VERONICA", "LOURDES", "SOLEDAD", "NOELIA", "LUZ", "CARLA", "BEGOÑA", "LORENA", "ALEJANDRA", "CONSUELO", "ASUNCION", "DANIELA", "OLGA", "FATIMA", "MILAGROS", "ESPERANZA", "BLANCA", "CATALINA", "NEREA", "MIRIAM", "LIDIA", "CLARA", "AURORA", "EMILIA", "MAGDALENA", "CELIA", "ANNA", "ELISA", "EUGENIA", "ADRIANA", "VIRGINIA", "VANESA", "JOSEFINA", "GEMA", "AINHOA", "PURIFICACION", "REMEDIOS", "MARTINA"
  ]

  POSSIBLE_SURNAMES: string[] = [
    "GARCIA", "BRIHUEGA", "VILLARROEL", "RODRÍGUEZ", "FERNÁNDEZ", "GONZALEZ", "GONZÁLEZ", "RODRIGUEZ", "FERNANDEZ", "FERNÁNDEZ", "ARAGÓN", "LOPEZ", "MARTINEZ", "SANCHEZ", "PEREZ", "GOMEZ", "MARTIN", "JIMENEZ", "RUIZ", "HERNANDEZ", "DIAZ", "MORENO", "MUÑOZ", "ALVAREZ", "ROMERO", "ALONSO", "GUTIERREZ", "NAVARRO", "TORRES", "DOMINGUEZ", "VAZQUEZ", "RAMOS", "GIL", "RAMIREZ", "SERRANO", "BLANCO", "MOLINA", "MORALES", "SUAREZ", "ORTEGA", "DELGADO", "CASTRO", "ORTIZ", "RUBIO", "MARIN", "SANZ", "NUÑEZ", "IGLESIAS", "MEDINA", "GARRIDO", "CORTES", "CASTILLO", "SANTOS", "LOZANO", "GUERRERO", "CANO", "PRIETO", "MENDEZ", "CRUZ", "CALVO", "GALLEGO", "HERRERA", "MARQUEZ", "LEON", "VIDAL", "PEÑA", "FLORES", "CABRERA", "CAMPOS", "VEGA", "FUENTES", "HENRIQUEZ", "CARRASCO", "DIEZ", "REYES", "CABALLERO", "NIETO", "AGUILAR", "PASCUAL", "SANTANA", "HERRERO", "MONTERO", "LORENZO", "HIDALGO", "GIMENEZ", "IBAÑEZ", "FERRER", "DURAN", "SANTIAGO", "BENITEZ", "VARGAS", "MORA", "VICENTE", "ARIAS", "CARMONA", "CRESPO", "ROMAN", "PASTOR", "SOTO", "SAEZ", "VELASCO", "MOYA", "SOLER", "PARRA", "ESTEBAN", "BRAVO", "GALLARDO", "ROJAS"
  ]

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private imageSharing: ImageSharingService, private bottomSheet: MatBottomSheet) {
    imageSharing.imageSelected.subscribe(
      (image: any) => this.startUpload(image)
    )
  }

  // function to store the registerOnChange method
  propagateChange = (_: any) => { };

  //Called when you instantiate a new FormControl (Value given this case empty string)
  writeValue(obj: any): void {
    if (obj !== undefined) {
      this.url = obj;
    }
  }

  // Called each time you want to change the property binded, in this case with the value of the url, assign the funcition to propagate change
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  // Called when there's a new touch event (not necessary here)
  registerOnTouched(fn: any): void {

  }

  //To set the property disabled when the form is disabled
  setDisabledState(isDisabled: boolean): void {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  fileChangeListener(event: FileList) {
    const file = event.item(0)
    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ')
      return;
    }
    this.imageSharing.image = file;
    this.bottomSheet.open(ImageEditComponentSheet, {
      data: {
        width: this.widthCrop,
        height: this.heightCrop
      }
    })
  }


  /**
   * Start the upload of a given image
   * @param image - blob of the image
   */
  startUpload(image: any) {

    // const timestamp = new Date().getTime().toString();
    const docId = this.db.createId();


    // The storage path
    const path = `${docId}.jpg`;

    // Totally optional metadata
    const customMetadata = { app: 'Imagen Card Reader' };

    // Reference of firebase firestore database
    const photoRef = this.db.collection('photos').doc(docId);

    photoRef.valueChanges().subscribe(
      (data: ResultOCR) => {
        if (data != undefined) {
          const results = data.description.slice(1);
          const result_mail = results.find(value => this.REGEX_MAIL.test(value));
          const result_twitter = results.find(value => this.REGEX_TWITTER.test(value));
          const result_phone = results.filter(value => this.REGEX_PHONE_NUMBER.test(value)).join("");
          const possible_name = results.filter(value => this.REGEX_POSSIBLE_NAMES.test(value))

          const possible_name_filtered = possible_name.filter(value =>
            (this.POSSIBLE_NAMES.includes(value.toUpperCase()) || this.POSSIBLE_SURNAMES.includes(value.toUpperCase()))
          );

          const possible_name_string = possible_name_filtered.join(" ");
          console.log(possible_name_string);
          const result_twitter_filter = result_twitter ? result_twitter : "";
          const result_mail_filter = result_mail ? result_mail : "";
          const result_phone_filter = result_phone ? result_phone : "";
          const result_name_filter = possible_name_string ? possible_name_string : "";
          this.results_filtered = { username: result_twitter, phone: result_phone, email: result_mail, possible_name: possible_name_filtered, name: "" };
        };
      }
    )

    // The main task
    this.task = this.storage.upload(path, image, { customMetadata })
    const ref = this.storage.ref(path);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = ref.getDownloadURL();
        this.downloadURL.subscribe(url => {
          this.propagateChange(url);
        });
      }
      )
    )
      .subscribe()
    // The file's download URL  



  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes
  }

  resetData() {
    this.downloadURL = null;
    this.percentage = null;
    this.snapshot = null;
  }

}


@Component({
  selector: 'app-image-edit-sheet',
  templateUrl: './image-edit.component-sheet.html',
  styleUrls: ['./file-upload.component.scss']
})
export class ImageEditComponentSheet {
  dataPhoto: any;
  image: any;
  cropperReady = false;


  constructor(public bottomSheetRef: MatBottomSheetRef<ImageEditComponentSheet>, private sharingImage: ImageSharingService, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.image = this.sharingImage.image;
  }

  imageCroppedFile(file: any) {
    this.dataPhoto = file;
  }

  imageLoaded() {
    this.cropperReady = true;
  }
  imageLoadFailed() {
    console.log('Load failed');
  }

  uploadTrimmedImage() {
    this.sharingImage.imageSelected.emit(this.dataPhoto);
    this.bottomSheetRef.dismiss();
  }
}