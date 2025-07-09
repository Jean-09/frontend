import { Component, OnInit } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalles-docentes',
  templateUrl: './detalles-docentes.page.html',
  styleUrls: ['./detalles-docentes.page.scss'],
  standalone: false
})
export class DetallesDocentesPage implements OnInit {

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
    await this.getDoce();
     await this.getToken
  }
  token='';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }
  docente:any;

  getDoce(){
    this.docente = history.state.docente
    console.log(this.docente)
  }
}
