import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, IonPopover } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-llegadas',
  templateUrl: './llegadas.page.html',
  styleUrls: ['./llegadas.page.scss'],
  standalone: false
})
export class LlegadasPage implements OnInit {

  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;
  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }

    async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

  constructor( private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.getLlegadas();
    await this.getToken
  }
  token='';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  llegadas:any;

  getLlegadas(){
    this.llegadas = history.state.llegadas
    console.log('Esto es lo que llega',this.llegadas)
  }

}
