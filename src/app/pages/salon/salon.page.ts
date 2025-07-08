import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';
import { AlertController, IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';

@Component({
  selector: 'app-salon',
  templateUrl: './salon.page.html',
  styleUrls: ['./salon.page.scss'],
  standalone: false
})
export class SalonPage implements OnInit {

  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;

  isEditing = false;
  salonEditId: string | null = null;

  constructor(private api: ApiService, private storage: Storage, private route: Router, private alertController: AlertController) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getSalon();
    await this.getdocentes();
    await this.getAlumnos();

  }

  // Abre el menú desplegable
  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }

  openAddModal() {
    this.isEditing = false;
    this.salonEditId = null;
    this.limpiarFormulario();
    this.previewImage = null;
    this.modal.present();
  }

  openEditModal(salon: any) {
    console.log('estos son los datos del salon', salon)
    this.isEditing = true;
    this.salonEditId = salon.documentId;
    this.nuevoSalon = {
      Numero: salon.Numero,
      estado: salon.estado,
      docente: salon.docente?.documentId ? [salon.docente.documentId] as any[] : [] as any[],
      alumnos: salon.alumnos?.map((a: any) => a.documentId) || [],

    };

    this.modal.present();
  }

  salon: any[] = [];
  token = '';
  paginaActual = 1;
  porPagina = 20;
  cargando = false;
  infiniteScrollEvent: any = null;
  previewImage: string | ArrayBuffer | null = null;

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  docente: any[] = [];

  getdocentes() {
    this.api.getDoce(this.token).then((res) => {
      this.docente = res;
      console.log(this.docente);
    }).catch((error) => {
      console.log(error);
    })
  }

  alumnos: any[] = [];

  getAlumnos() {
    this.api.getAlum(this.token).then((res) => {
      this.alumnos = res;
      console.log(this.alumnos);
    }).catch((error) => {
      console.log(error);
    })
  }

  getSalon(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.salon = [];
    }

    this.cargando = true;

    this.api.getSalon(this.token, this.paginaActual, this.porPagina).then((res) => {
      if (event) this.infiniteScrollEvent = event;

      this.salon = [...this.salon, ...res];

      this.salon.sort((a, b) => {
        if (a.estado === b.estado) return 0;
        if (a.estado === true) return -1;
        return 1;
      });

      if (event) {
        event.target.complete();
        if (res.length < this.porPagina) {
          event.target.disabled = true;
        }
      }

      this.paginaActual++;
      this.cargando = false;
      console.log(this.salon)

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }

  async updateSalon() {
    if (!this.salonEditId) return;

    try {
      const data = {
        Numero: this.nuevoSalon.Numero,
        estado: this.nuevoSalon.estado,
        docente: this.nuevoSalon.docente,
        alumnos: this.nuevoSalon.alumnos,
      };

      await this.api.putSalon(this.salonEditId, data, this.token);

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.modal.dismiss();
      await this.getSalon(undefined, true);

    } catch (error) {
      console.error('Error al actualizar el docente:', error);
      await this.presentAlert('Ocurrió un error al actualizar el docente.');
    }
  }


  async addSalon(nuevoSalonParam?: any) {
    const salon = nuevoSalonParam ?? this.nuevoSalon;
    console.log(salon)

    try {
      if (!salon.Numero || !salon.docente || !salon.estado || !salon.alumnos) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      const data = {
        Numero: salon.Numero,
        estado: true,
        docente: salon.docente,
        alumnos: salon.alumnos,
      };

      await this.api.postSalon(data, this.token);

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.modal.dismiss();
      await this.getSalon(undefined, true);

    } catch (error) {
      console.error('Error al agregar el docente:', error);
      if (!nuevoSalonParam) {
        await this.presentAlert('Ocurrió un error al agregar el docente.');
      }
    }
  }

  toggleStatus(s: any) {
    const nuevoEstado = !s.estado;

    this.api.delsalon(s, nuevoEstado, this.token).then((res) => {
      console.log('Estado cambiado:', res);
      s.estado = nuevoEstado;
      this.getSalon();
    }).catch((error) => {
      console.error('Error al cambiar estado:', error);
    });
  }
  async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

  limpiarFormulario() {
    this.nuevoSalon = {
      Numero: '',
      estado: true,
      docente: [],
      alumnos: [],
    };
  }

  mostrarFormulario = false;

  nuevoSalon: any = {
    Numero: '',
    estado: true,
    docente: [],
    alumnos: [],
  };

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  verDetallesSalon(salon: any) {
    console.log('salon', salon)
    this.route.navigate(['/detalles-salon'], {
      state: {
        salon: salon
      }
    })
  }

}
