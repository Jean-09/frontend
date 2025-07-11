import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, IonPopover } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-detalles-alumnos',
  templateUrl: './detalles-alumnos.page.html',
  styleUrls: ['./detalles-alumnos.page.scss'],
  standalone: false
})
export class DetallesAlumnosPage implements OnInit {


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


  constructor(private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.getAlumno();
    await this.getToken
  }
  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }
  alumno: any;

  getAlumno() {
    this.alumno = history.state.alumno
    console.log(this.alumno)
  }

  verLlegadas(alumno: any) {
    console.log('LLegadas por el alumno', alumno)
    this.route.navigate(['/llegadas'], {
      state: {
        llegadas: alumno.llegada
      }
    })
  }

}
