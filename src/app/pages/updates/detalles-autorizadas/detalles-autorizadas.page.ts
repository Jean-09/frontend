import { Component, OnInit } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalles-autorizadas',
  templateUrl: './detalles-autorizadas.page.html',
  styleUrls: ['./detalles-autorizadas.page.scss'],
  standalone: false
})
export class DetallesAutorizadasPage implements OnInit {

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
    await this.getAut();
     await this.getToken
  }
  token='';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }
  persona:any;

  getAut(){
    this.persona = history.state.autorizada
    console.log(this.persona)
  }
}
