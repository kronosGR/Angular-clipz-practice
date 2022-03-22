import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'fbTimeStamp'
})
export class FbTimeStampPipe implements PipeTransform {

  constructor(public datePipe: DatePipe){

  }

  transform(value: firebase.firestore.FieldValue) {
    const date = (value as firebase.firestore.Timestamp).toDate();
    return this.datePipe.transform(date,'mediumDate')
  }

  }
