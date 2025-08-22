import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';
import { AlertController, IonModal } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonPopover } from '@ionic/angular';

@Component({
  selector: 'app-autorizadas',
  templateUrl: './autorizadas.page.html',
  styleUrls: ['./autorizadas.page.scss'],
  standalone: false
})
export class AutorizadasPage implements OnInit {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;

  isEditing = false;
  autorizadaEditId: string | null = null;

  paginaActual = 1;
  porPagina = 10;
  cargando = false;
  infiniteScrollEvent: any = null;
  previewImage: string | ArrayBuffer | null = null;

   shouldShowLoadMore(): boolean {
    return this.hayMasAutorizada &&
      !this.searchTerm?.trim() &&
      this.autorizadas.length > 0;
  }

  constructor(private alertController: AlertController, private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getAutorizadas();
    await this.getAllAutorizadas()

  }

  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }


  openAddModal() {
    this.isEditing = false;
    this.autorizadaEditId = null;
    this.limpiarFormulario();
    this.previewImage = null;
    this.modal.present();
  }

  openEditModal(autorizada: any) {
    console.log(autorizada)
    this.isEditing = true;
    this.autorizadaEditId = autorizada.documentId;
    console.log('esto es lo que trae', autorizada)
    this.nuevoAutorizado = {
      nombre: autorizada.nombre,
      apellido: autorizada.apellidos,
      Estatus: autorizada.Estatus,
      email: autorizada.email,
      foto: null,
      telefono: autorizada.telefono,
      direccion: autorizada.Domicilio,
      estatus: true,
    };

    if (autorizada.foto && autorizada.foto.url) {
      this.previewImage = 'http://localhost:1337' + autorizada.foto.url;
    } else {
      this.previewImage = null;
    }

    this.modal.present();
  }



  autorizadas: any[] = [];
  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  searchTerm: string = '';

  filterAutorizadas() {
    if (!this.searchTerm) {
      return this.autorizadas;
    }

    const terms = this.searchTerm.toLowerCase().split(' ').filter(t => t);

    return this.allAutorizada.filter(a => {
      const nombre = a.nombre?.toLowerCase() || '';
      const apellidos = a.apellidos?.toLowerCase() || '';
      const fullName = `${nombre} ${apellidos}`;

      return terms.every(term =>
        nombre.includes(term) ||
        apellidos.includes(term) ||
        fullName.includes(term)
      );
    });
  }

  hayMasAutorizada: boolean = true;

  getAutorizadas(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.autorizadas = [];
      this.hayMasAutorizada = true;
    }

    this.cargando = true;



    this.api.getAut(this.token, this.paginaActual, this.porPagina).then((res) => {
      if (event) this.infiniteScrollEvent = event;

      this.autorizadas = [...this.autorizadas, ...res];

      this.autorizadas.sort((a, b) => {
        if (a.estatus === b.estatus) return 0;
        if (a.estatus === true) return -1;
        return 1;

      });

      if (event) {
        event.target.complete();
        if (res.length < this.porPagina) {
          event.target.disabled = true;
          this.hayMasAutorizada = false;
        }
      } else {
        // Manejo para el botón
        if (res.length < this.porPagina) {
          this.hayMasAutorizada = false;
        }
      }

      this.paginaActual++;
      this.cargando = false;
      console.log(this.autorizadas)

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }

    allAutorizada:any[]=[];
  
  getAllAutorizadas(){
     this.api.getAllAut(this.token).then((res: any[]) => {
      this.allAutorizada = res.sort((a: any, b: any) => {
        if (a.Estatus === b.Estatus) return 0;
        if (a.Estatus === true) return -1;
        return 1;
      });
      console.log('estos son todos los salones', this.allAutorizada)
    }).catch((error) => {
      console.log(error);
    });
  }


  toggleStatus(a: any) {
    const nuevoEstado = !a.estatus;

    this.api.delAut(a, nuevoEstado, this.token).then((res) => {
      console.log('Estado cambiado:', res);
      a.estatus = nuevoEstado;
      this.getAutorizadas();
    }).catch((error) => {
      console.error('Error al cambiar estado:', error);
    });
  }

  async updateAut() {
    if (!this.autorizadaEditId) return;

    try {
      const data = {
        nombre: this.nuevoAutorizado.nombre,
        apellido: this.nuevoAutorizado.apellidos,
        telefono: this.nuevoAutorizado.telefono,
        Domicilio: this.nuevoAutorizado.direccion,
        estatus: this.nuevoAutorizado.estatus,
      };


      await this.api.putAut(this.autorizadaEditId, data, this.token);

      if (this.nuevoAutorizado.foto) {
        const uploadRes = await this.api.uploadFileAut(this.token, this.nuevoAutorizado.foto);
        const fileId = uploadRes.data[0].id;
        await this.api.imagenAut(this.token, this.autorizadaEditId, fileId);
      }

      this.modal.dismiss();
      this.limpiarFormulario();
      this.getAutorizadas(undefined, true);
    } catch (error) {
      console.error(error);
      this.presentAlert('Ocurrió un error al actualizar el docente.');
    }
  }

  async addAut(nuevoAutorizadaParam?: any) {
    const autorizada = nuevoAutorizadaParam ?? this.nuevoAutorizado;

    try {
      if (!autorizada.nombre || !autorizada.apellido || !autorizada.estatus || !autorizada.direccion || !autorizada.telefono) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      let userDocumentId: string | undefined;

      // Registro del usuario
      try {
        const user = {
          username: autorizada.nombre,
          email: autorizada.email,
          password: autorizada.email.split('@')[0] // Usamos el nombre como contraseña temporal
        };

        const userCreateRes = await this.api.postUserAutorizado(user, this.token);
        userDocumentId = userCreateRes.user?.documentId || userCreateRes.user.documentId;
        console.log('la supuesta id ', userDocumentId)

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

      const data = {
        nombre: autorizada.nombre,
        apellidos: autorizada.apellido,
        telefono: autorizada.telefono,
        Domicilio: autorizada.direccion,
        email: autorizada.email,
        estatus: autorizada.estatus,
        user: userDocumentId,
      };

      

      const createRes = await this.api.postAut(data, this.token);
      const docenteId = createRes.data.data.documentId;

      if (autorizada.foto) {
        try {
          const uploadRes = await this.api.uploadFileAut(this.token, autorizada.foto);
          const fileId = uploadRes.data[0].id;

          await this.api.imagenAut(this.token, docenteId, fileId);
        } catch (uploadError) {
          console.error('Error subiendo o ligando foto:', uploadError);
          await this.presentAlert('Error al subir o ligar la foto.');
          return; // Detenemos la función si falla la imagen
        }
      } else {
        if (!nuevoAutorizadaParam) await this.presentAlert('Debes subir una foto para continuar.');
        return;
      }

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.modal.dismiss();
      this.getAutorizadas(undefined, true);

    } catch (error) {
      console.error('Error al agregar alumno:', error);
      if (!nuevoAutorizadaParam) await this.presentAlert('Ocurrió un error al agregar el alumno.');
    }
  }


  async addDoceBatch(docentesArray: any[], concurrencyLimit = 3) {
    let index = 0;

    while (index < docentesArray.length) {
      const lote = docentesArray.slice(index, index + concurrencyLimit);
      await Promise.all(lote.map(docente => this.addAut(docente)));

      index += concurrencyLimit;
    }
  }

  async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

  limpiarFormulario() {
    this.nuevoAutorizado = {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      estatus: true,
      foto: null
    };
  }

  mostrarFormulario = false;

  nuevoAutorizado: any = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
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
    this.nuevoAutorizado.foto = archivo;

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

  verDetallesAut(autorizada: any) {
    console.log('autorizada', autorizada)
    this.route.navigate(['/detalles-autorizadas'], {
      state: {
        autorizada: autorizada
      }
    })
  }
}


