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
  @ViewChild('modalDocente') modalDocente!: IonModal;
  isMenuOpen = false;

  isEditing = false;
  salonEditId: string | null = null;

  previewImageDocente: string | ArrayBuffer | null = null;

  constructor(private api: ApiService, private storage: Storage, private route: Router, private alertController: AlertController) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getSalon();
    await this.getAllSalones()
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

  abrirModalDocente() {
    this.modalDocente.present();
  }

  salon: any[] = [];
  token = '';
  paginaActual = 10;
  porPagina = 1;
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
  // Agrega estas variables junto a las demás
  busquedaDocente: string = '';
  mostrarListaDocentes: boolean = false;
  docentesFiltrados: any[] = [];

  getdocentes() {
    this.api.getDoce(this.token).then((res) => {
      this.docente = res;
      this.docentesFiltrados = [...this.docente]; // Inicializa con todos los docentes
      console.log(this.docente);
    }).catch((error) => {
      console.log(error);
    });
  }

  filtrarDocentes() {
    if (!this.busquedaDocente) {
      this.docentesFiltrados = [...this.docente]; // Muestra todos si no hay búsqueda
      return;
    }
    this.docentesFiltrados = this.docente.filter(d =>
      d.nombre.toLowerCase().includes(this.busquedaDocente.toLowerCase()) ||
      d.apellido?.toLowerCase().includes(this.busquedaDocente.toLowerCase())
    );
  }

  seleccionarDocente(docente: any) {
    this.busquedaDocente = `${docente.nombre} ${docente.apellido || ''}`.trim();
    this.nuevoSalon.docente = [docente.documentId]; // Asigna el ID del docente
    this.mostrarListaDocentes = false; // Oculta la lista
  }

  seleccionarFotoDocente(event: any) {
    const archivo = event.target.files[0];
    this.nuevoDocente.foto = archivo;
    console.log(archivo)

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageDocente = reader.result;
    };
    if (archivo) {
      reader.readAsDataURL(archivo);
    } else {
      this.previewImage = null;
    }
  }

  alumnos: any[] = [];

  getAlumnos() {
    this.api.getAlum(this.token).then((res) => {
      this.alumnos = res;
    }).catch((error) => {
      console.log(error);
    })
  }

  
  hayMasSalones: boolean = true;
  getSalon(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.salon = [];
      this.hayMasSalones = true; // Añade esta variable para controlar si hay más alumnos
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
           this.hayMasSalones = false;
        }
      }else {
        // Manejo para el botón
        if (res.length < this.porPagina) {
          this.hayMasSalones = false;
        }
      }

      this.paginaActual++;
      this.cargando = false;
      console.log('estos son los salones', this.salon)

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }

  allSalones:any[]=[];
  
  getAllSalones(){
     this.api.getAllSalon(this.token).then((res: any[]) => {
      this.allSalones = res.sort((a: any, b: any) => {
        if (a.Estatus === b.Estatus) return 0;
        if (a.Estatus === true) return -1;
        return 1;
      });
      console.log('estos son todos los salones', this.allSalones)
    }).catch((error) => {
      console.log(error);
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

  // En tu componente.ts
searchTerm: string = '';

// Esta función filtra los salones según el término de búsqueda
filterSalones() {
  if (!this.searchTerm) {
    return this.salon;  // Si no hay búsqueda, devuelve todos
  }

  const term = this.searchTerm.toLowerCase();
  return this.allSalones.filter(s => 
    s.Numero.toLowerCase().includes(term) || 
    (s.docente && s.docente.nombre.toLowerCase().includes(term)))
}


  async addSalon(nuevoSalonParam?: any) {
    const salon = nuevoSalonParam ?? this.nuevoSalon;
    console.log( 'estos son los salones', salon)

    try {
      if (!salon.Numero || !salon.docente || !salon.estado) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      const data = {
        Numero: salon.Numero,
        estado: true,
        docente: salon.docente,
      };

      await this.api.postSalon(data, this.token);

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.busquedaDocente = '';
      this.modal.dismiss();
      await this.getSalon(undefined, true);

    } catch (error) {
      console.error('Error al agregar el docente:', error);
      if (!nuevoSalonParam) {
        await this.presentAlert('Ocurrió un error al agregar el docente.');
      }
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
          password: docente.nombre
        };

        const userCreateRes = await this.api.postUser(user, this.token);
        userDocumentId = userCreateRes.data.user?.documentId || userCreateRes.data.documentId;

        if (!userDocumentId) {
          console.error('No se pudo obtener el documentId del usuario:', userCreateRes.data);
          await this.presentAlert('Error al registrar el usuario. No se obtuvo el ID de documento.');
          return;
        }
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
        }
      }

      // Dentro de addDoce(), después de crear el docente:
      const docenteCreado = {
        documentId: docenteId,
        nombre: docente.nombre,
        apellido: docente.apellido
      };

      // 1. Asigna al formulario
      this.nuevoSalon.docente = [docenteId];

      // 2. Actualiza la lista visual
      this.docentesFiltrados = [docenteCreado, ...this.docentesFiltrados];

      // 3. Cierra solo el modal de docente (mantén abierto el de salón)
      this.modalDocente.dismiss();

      // Limpieza y cierre
      this.mostrarFormulario = false;
      this.limpiarFormulario();
      
      this.modalDocente.dismiss();
      await this.getdocentes();

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
      docente: []
    };
  }

  mostrarFormulario = false;

  nuevoSalon: any = {
    Numero: '',
    estado: true,
    docente: []
  };

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

  verDetallesSalon(salon: any) {
    console.log('salon', salon)
    this.route.navigate(['/detalles-salon'], {
      state: {
        salon: salon
      }
    })
  }

}
