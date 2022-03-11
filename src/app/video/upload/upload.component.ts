import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your clip is being uploaded';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null;

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {
    auth.user.subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {}

  storeFile($event: Event) {
    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    task.percentageChanges().subscribe((progress) => {
      this.percentage = (progress as number) / 100;
    });

    task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: (url) => {
          const clip = {
            uid: this.user?.uid,
            displayName: this.user?.displayName,
            title: this.title.value,
            filename: `${clipFileName}.mp4`,
            url,
          };
          this.alertColor = 'green';
          this.alertMsg = 'Success!';
          this.showPercentage = false;
        },
        error: (error) => {
          this.alertColor = 'red';
          this.alertMsg = 'Upload Failed. Try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
