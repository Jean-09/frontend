import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';
import { AlertController, IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.page.html',
  styleUrls: ['./docente.page.scss'],
  standalone: false
})
export class DocentePage implements OnInit {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;

  isEditing = false;
  docenteEditId: string | null = null;

  constructor(private api: ApiService, private storage: Storage, private route: Router, private alertController: AlertController) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getDocentes();
  }

  // Abre el menú desplegable
  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }

  openAddModal() {
    this.isEditing = false;
    this.docenteEditId = null;
    this.limpiarFormulario();
    this.previewImage = null;
    this.modal.present();
  }

  openEditModal(docente: any) {
    console.log(docente)
    this.isEditing = true;
    this.docenteEditId = docente.documentId;
    this.nuevoDocente = {
      nombre: docente.nombre,
      apellido: docente.apellido,
      estatus: docente.estatus,
      foto: null,

    };

    if (docente.foto && docente.foto[0]?.url) {
      this.previewImage = 'http://localhost:1337' + docente.foto[0].url;
    } else {
      this.previewImage = null;
    }

    this.modal.present();
  }

  docentes: any[] = [];
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

    // En tu componente.ts
  searchTerm: string = '';

  filterDocentes() {
  if (!this.searchTerm) {
    return this.docentes;
  }

  const terms = this.searchTerm.toLowerCase().split(' ').filter(t => t);

  return this.docentes.filter(docentes => {
    const nombre = docentes.nombre?.toLowerCase() || '';
    const apellido = docentes.apellido?.toLowerCase() || '';
    const fullName = `${nombre} ${apellido}`;

    return terms.every(term => 
      nombre.includes(term) || 
      apellido.includes(term) ||
      fullName.includes(term)
    );
  });
}

  getDocentes(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.docentes = [];
    }

    this.cargando = true;

    this.api.getDoce(this.token, this.paginaActual, this.porPagina).then((res) => {
      if (event) this.infiniteScrollEvent = event;

      this.docentes = [...this.docentes, ...res];

      this.docentes.sort((a, b) => {
        if (a.estatus === b.estatus) return 0;
        if (a.estatus === true) return -1;
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
      console.log(this.docentes)

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }

  async toggleStatus(d: any) {
    try {
      const nuevoEstado = !d.estatus;

      const res = await this.api.delDocente(d, nuevoEstado, this.token);
      console.log('Estado cambiado:', res);
      d.estatus = nuevoEstado;

      await this.getDocentes();

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      await this.presentAlert('Error al actualizar el estado');
      // Mantener el estado anterior si falla
      d.estatus = !d.estatus;
    }
  }

  async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

  async updateDoce() {
    if (!this.docenteEditId) return;

    try {
      const data = {
        nombre: this.nuevoDocente.nombre,
        apellido: this.nuevoDocente.apellido,
        estatus: this.nuevoDocente.estatus,
        user: this.nuevoDocente.user,
      };


      await this.api.putDoce(this.docenteEditId, data, this.token);

      if (this.nuevoDocente.foto) {
        const uploadRes = await this.api.uploadFileDoce(this.token, this.nuevoDocente.foto);
        const fileId = uploadRes.data[0].id;
        await this.api.imagenDoce(this.token, this.docenteEditId, fileId);
      }

      this.modal.dismiss();
      this.limpiarFormulario();
      this.getDocentes(undefined, true);
    } catch (error) {
      console.error(error);
      this.presentAlert('Ocurrió un error al actualizar el docente.');
    }
  }

async addDoce(nuevoDocenteParam?: any) {
  const docente = nuevoDocenteParam ?? this.nuevoDocente;

  try {
    // Validación de campos obligatorios
    if (!docente.nombre || !docente.apellido || !docente.estatus || !docente.gmail) {
      await this.presentAlert('Por favor, complete todos los datos obligatorios.');
      return;
    }

    let userDocumentId: string | undefined;

    // Registro del usuario
    try {
      const user = {
        username: docente.nombre,
        email: docente.gmail,
        password: docente.nombre // Usamos el nombre como contraseña temporal
      };
      
      const userCreateRes = await this.api.postUser(user, this.token);
      userDocumentId = userCreateRes.data.user?.documentId || userCreateRes.data.documentId;

      if (!userDocumentId) {
        console.error('No se pudo obtener el documentId del usuario:', userCreateRes.data);
        await this.presentAlert('Error al registrar el usuario. No se obtuvo el ID de documento.');
        return;
      }

      console.log('Usuario creado con documentId:', userDocumentId);

    } catch (userError) {
      console.error('Error al crear el usuario:', userError);
      await this.presentAlert('Error al registrar el usuario del docente. Por favor verifique los datos e intente nuevamente.');
      return;
    }

    // Creación del registro del docente
    const data = {
      nombre: docente.nombre,
      apellido: docente.apellido,
      estatus: docente.estatus,
      user: userDocumentId,
    };

    const createRes = await this.api.postDoce(data, this.token);
    const docenteId = createRes.data.data.documentId;

    // Manejo de la foto si existe
    if (docente.foto) {
      try {
        const uploadRes = await this.api.uploadFileDoce(this.token, docente.foto);
        const fileId = uploadRes.data[0].id;
        await this.api.imagenDoce(this.token, docenteId, fileId);
      } catch (uploadError) {
        console.error('Error subiendo foto:', uploadError);
        await this.presentAlert('Advertencia: La foto no pudo ser subida correctamente.');
      }
    } else if (!nuevoDocenteParam) {
      await this.presentAlert('Advertencia: No se ha subido ninguna foto para el docente.');
    }

    // Limpieza y cierre
    this.mostrarFormulario = false;
    this.limpiarFormulario();
    this.modal.dismiss();
    await this.getDocentes(undefined, true);

    // Mensaje de éxito
    if (!nuevoDocenteParam) {
      await this.presentAlert('Docente registrado exitosamente. Las credenciales han sido enviadas al correo proporcionado.');
    }

  } catch (error) {
    console.error('Error en el proceso completo:', error);
    if (!nuevoDocenteParam) {
      await this.presentAlert('Ocurrió un error inesperado durante el registro. Por favor intente nuevamente.');
    }
  }
}

  async addDoceBatch(docentesArray: any[], concurrencyLimit = 3) {
    let index = 0;

    while (index < docentesArray.length) {
      const lote = docentesArray.slice(index, index + concurrencyLimit);
      await Promise.all(lote.map(docente => this.addDoce(docente)));

      index += concurrencyLimit;
    }
  }

  limpiarFormulario() {
    this.nuevoDocente = {
      nombre: '',
      apellido: '',
      estatus: true,
      foto: null
    };
  }

  mostrarFormulario = false;

  nuevoDocente: any = {
    nombre: '',
    apellido: '',
    estatus: true,
    foto: null
  };

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  seleccionarFoto(event: any) {
    const archivo = event.target.files[0];
    this.nuevoDocente.foto = archivo;

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

  verDetallesDoce(docente: any) {
    console.log('Docente', docente)
    this.route.navigate(['/detalles-docentes'], {
      state: {
        docente: docente
      }
    })
  }

}

