import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from '../../service/api.service';
import { AlertController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';


@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: false,
})
export class AlumnosPage implements OnInit {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;

inputNombreDocente = '';
mostrarLista = false;

  
  isEditing = false;
  alumnoEditId: string | null = null;

  constructor(private alertController: AlertController, private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getAlumnos();
    await this.getAutorizadas();
    await this.getdocentes();
    this.filteredDocentes = [...this.docente];

  }

  filteredDocentes: any[] = [];  // Lista filtrada

  // Filtra docentes al escribir
  filterDocentes(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredDocentes = this.docente.filter(d =>
      d.nombre.toLowerCase().includes(searchTerm)
    );
  }


  buscador(query: string) {
    const searchTerm = query?.trim() || '';

    this.api.GetDocent(searchTerm, this.token)
      .then((res) => {
        this.docente = res.data || [];
      })
      .catch((error) => {
        console.error('Error al buscar docentes', error);
        this.docente = []; // Limpiar resultados en caso de error
      });
  }


  // Abre el menú desplegable
  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }

  openAddModal() {
    this.isEditing = false;
    this.alumnoEditId = null;
    this.limpiarFormulario();
    this.previewImage = null;
    this.modal.present();
  }

  openEditModal(alumno: any) {
    console.log(alumno)
    this.isEditing = true;
    this.alumnoEditId = alumno.documentId;
    this.nuevoAlumno = {
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      Estatus: alumno.Estatus,
      foto: null,
      autorizadas: alumno.persona_autorizadas?.map((p: any) => p.documentId) || [],
      docente: alumno.docente?.documentId ? [alumno.docente.documentId] as any[] : [] as any[]
    };

    if (alumno.foto && alumno.foto[0]?.url) {
      this.previewImage = 'http://localhost:1337' + alumno.foto[0].url;
    } else {
      this.previewImage = null;
    }

    this.modal.present();
  }

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  token = '';
  alumnos: any[] = [];
  paginaActual = 1;
  porPagina = 20;
  cargando = false;
  infiniteScrollEvent: any = null;
  autorizadas: any[] = [];
  previewImage: string | ArrayBuffer | null = null;

  getAlumnos(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.alumnos = [];
    }

    this.cargando = true;

    this.api.getAlum(this.token, this.paginaActual, this.porPagina).then((res) => {
      if (event) this.infiniteScrollEvent = event;

      this.alumnos = [...this.alumnos, ...res];

      this.alumnos.sort((a, b) => {
        if (a.Estatus === b.Estatus) return 0;
        if (a.Estatus === true) return -1;
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
      console.log(this.alumnos)

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }


  getAutorizadas() {
    this.api.getAut(this.token).then((res) => {
      this.autorizadas = res;
      console.log(this.autorizadas);
    }).catch((error) => {
      console.log(error);
    })
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



  seleccionarFoto(event: any) {
    const archivo = event.target.files[0];
    this.nuevoAlumno.foto = archivo;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
    };
    if (archivo) {
      reader.readAsDataURL(archivo);
    } else {
      this.previewImage = null;
    }
  }

  toggleStatus(a: any) {
    const nuevoEstado = !a.Estatus;

    this.api.delAlumno(a, nuevoEstado, this.token).then((res) => {
      console.log('Estado cambiado:', res);
      a.Estatus = nuevoEstado;
      this.getAlumnos();
    }).catch((error) => {
      console.error('Error al cambiar estado:', error);
    });
  }




  async updateAlum() {
    if (!this.alumnoEditId) return;

    try {
      const data = {
        nombre: this.nuevoAlumno.nombre,
        apellido: this.nuevoAlumno.apellido,
        Estatus: this.nuevoAlumno.Estatus,
        persona_autorizadas: this.nuevoAlumno.autorizadas,
        docente: this.nuevoAlumno.docente
      };


      await this.api.putAlum(this.alumnoEditId, data, this.token);

      if (this.nuevoAlumno.foto) {
        const uploadRes = await this.api.uploadFile(this.token, this.nuevoAlumno.foto);
        const fileId = uploadRes.data[0].id;
        await this.api.imagenAlum(this.token, this.alumnoEditId, fileId);
      }

      this.modal.dismiss();
      this.limpiarFormulario();
      this.getAlumnos(undefined, true);
    } catch (error) {
      console.error(error);
      this.presentAlert('Ocurrió un error al actualizar el alumno.');
    }
  }

  async addAlum(nuevoAlumnoParam?: any) {
    const alumno = nuevoAlumnoParam ?? this.nuevoAlumno;

    try {
      if (!alumno.nombre || !alumno.apellido || !alumno.Estatus || !alumno.autorizadas) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      const data = {
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        Estatus: alumno.Estatus,
        persona_autorizadas: alumno.autorizadas,
        docente: alumno.docente
      };

      const createRes = await this.api.postAlum(data, this.token);
      const alumnoId = createRes.data.data.documentId;

      if (alumno.foto) {
        try {
          const uploadRes = await this.api.uploadFile(this.token, alumno.foto);
          const fileId = uploadRes.data[0].id;

          await this.api.imagenAlum(this.token, alumnoId, fileId);


          this.mostrarFormulario = false;
          this.limpiarFormulario();
          this.modal.dismiss();
          this.getAlumnos(undefined, true);


        } catch (uploadError) {
          console.error('Error subiendo o ligando foto:', uploadError);
          await this.presentAlert('Error al subir o ligar la foto.');
        }
      } else {
        if (!nuevoAlumnoParam) await this.presentAlert('Debes subir una foto para continuar.');
      }

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.modal.dismiss();
      this.getAlumnos();

    } catch (error) {
      console.error('Error al agregar alumno:', error);
      if (!nuevoAlumnoParam) await this.presentAlert('Ocurrió un error al agregar el alumno.');
    }
  }

  async addAlumBatch(alumnosArray: any[], concurrencyLimit = 3) {
    let index = 0;

    while (index < alumnosArray.length) {
      const lote = alumnosArray.slice(index, index + concurrencyLimit);
      await Promise.all(lote.map(alumno => this.addAlum(alumno)));

      index += concurrencyLimit;
    }
  }




  limpiarFormulario() {
    this.nuevoAlumno = {
      nombre: '',
      apellido: '',
      Estatus: true,
      foto: null,
      autorizadas: [],
      docente: []
    };
  }

  mostrarFormulario = false;

  nuevoAlumno: any = {
    nombre: '',
    apellido: '',
    Estatus: true,
    foto: null,
    autorizadas: [],
    docente: []
  };


  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  verDetallesAlum(alumno: any) {
    console.log('Alumno', alumno)
    this.route.navigate(['/detalles-alumnos'], {
      state: {
        alumno: alumno
      }
    })
  }

  async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

}
