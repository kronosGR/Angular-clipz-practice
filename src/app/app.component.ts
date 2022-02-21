import { Component } from '@angular/core';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Angular-clipz-practice';
  showModal = true;

  constructor(public modal: ModalService){}

  ngOnInit() {
    setInterval(() => (this.showModal = !this.showModal), 1000);
  }
}
