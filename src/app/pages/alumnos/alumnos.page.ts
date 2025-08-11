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
  @ViewChild('modalDocente') modalDocente!: IonModal;
  @ViewChild('modalAutorizada') modalAutorizada!: IonModal;
  @ViewChild('modalSalon') modalSalon!: IonModal;

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
    await this.getSalones();
    await this.getAllAlumnos();
    this.filteredDocentes = [...this.docente];

  }

  filteredDocentes: any[] = [];

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

  abrirModalDocente() {
    this.modalDocente.present();
  }

  abrirModalAutorizada() {
    this.modalAutorizada.present();
  }
  abrirModalSalon() {
    this.modalSalon.present();
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
      salon: alumno.salon?.documentId ? [alumno.salon.documentId] as any[] : [] as any[],
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
  allAlumnos: any[] = [];
  paginaActual = 1;
  porPagina = 15;
  cargando = false;
  infiniteScrollEvent: any = null;
  autorizadas: any[] = [];
  previewImage: string | ArrayBuffer | null = null;
  previewImageAutorizada: string | ArrayBuffer | null = null;
  previewImageDocente: string | ArrayBuffer | null = null;

  hayMasAlumnos: boolean = true;

  // Agrega esta propiedad en tu componente
  isFilterActive(): boolean {
    return !!this.searchTerm && this.searchTerm.trim() !== '';
  }

  shouldShowLoadMore(): boolean {
    return this.hayMasAlumnos &&
      !this.searchTerm?.trim() &&
      this.alumnos.length > 0;
  }

  searchTerm: string = '';

  filterAlumno() {
    if (!this.searchTerm) {
      return this.allAlumnos;
    }

    const terms = this.searchTerm.toLowerCase().split(' ').filter(t => t);

    return this.allAlumnos.filter(alumno => {
      const nombre = alumno.nombre?.toLowerCase() || '';
      const apellido = alumno.apellido?.toLowerCase() || '';
      const fullName = `${nombre} ${apellido}`;

      return terms.every(term =>
        nombre.includes(term) ||
        apellido.includes(term) ||
        fullName.includes(term)
      );
    });
  }

  getAlumnos(event?: any, reset: boolean = false) {
    if (this.cargando) {
      if (event) event.target.complete();
      return;
    }

    if (reset) {
      this.paginaActual = 1;
      this.alumnos = [];
      this.hayMasAlumnos = true; // Añade esta variable para controlar si hay más alumnos
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
          this.hayMasAlumnos = false;
        }
      } else {
        // Manejo para el botón
        if (res.length < this.porPagina) {
          this.hayMasAlumnos = false;
        }
      }

      this.paginaActual++;
      this.cargando = false;
      console.log(this.alumnos);

    }).catch((error) => {
      console.log(error);
      if (event) event.target.complete();
      this.cargando = false;
    });
  }

getAllAlumnos() {
  this.api.getAllAlum(this.token).then((res: any[]) => { 
    this.allAlumnos = res.sort((a: any, b: any) => { 
      if (a.Estatus === b.Estatus) return 0;
      if (a.Estatus === true) return -1;
      return 1;
    });
    console.log('estos son todos los alumnos', this.allAlumnos)
  }).catch((error) => {
    console.log(error);
  });
}



  getAutorizadas() {
    this.api.getAut(this.token).then((res) => {
      this.autorizadas = res;
    }).catch((error) => {
      console.log(error);
    })
  }

  docente: any[] = [];

  getdocentes() {
    this.api.getDoce(this.token).then((res) => {
      this.docente = res;
    }).catch((error) => {
      console.log(error);
    })
  }

  salon: any[] = [];

  getSalones() {
    this.api.getSalon(this.token).then((res) => {
      this.salon = res;
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

  seleccionarFotoAutorizada(event: any) {
    const archivo = event.target.files[0];
    this.nuevoAutorizado.foto = archivo;
    console.log('esta es la foto ', archivo)


    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageAutorizada = reader.result;
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
    if (this.nuevoAlumno.salon && this.nuevoAlumno.salon.documentId !== this.alumnos) {
      const salonResponse = await this.api.getSalonbyid(this.nuevoAlumno.salon.id, this.token);
      const docenteId = salonResponse.data.data.attributes.docente?.data?.id;
      
      // 3. Actualizar referencia al docente
      this.nuevoAlumno.docente = docenteId ? { id: docenteId } : null;
    }

    // 4. Preparar datos para actualización
    const updateData = {
      nombre: this.nuevoAlumno.nombre,
      apellido: this.nuevoAlumno.apellido,
      Estatus: this.nuevoAlumno.Estatus,
      persona_autorizadas: this.nuevoAlumno.autorizadas,
      docente: this.nuevoAlumno.docente,
      salon: this.nuevoAlumno.salon
    };

    // 5. Actualizar alumno (usando el servicio)
    await this.api.putAlum(this.alumnoEditId, updateData, this.token);

    // Resto de tu lógica para foto...
    if (this.nuevoAlumno.foto) {
      const uploadRes = await this.api.uploadFile(this.token, this.nuevoAlumno.foto);
      await this.api.imagenAlum(this.token, this.alumnoEditId, uploadRes.data[0].id);
    }

    this.modal.dismiss();
    this.limpiarFormulario();
    this.getAlumnos(undefined, true);

  } catch (error) {
    console.error(error);
    this.presentAlert('Error al actualizar alumno');
  }
}

  async addAlum(nuevoAlumnoParam?: any) {
    const alumno = nuevoAlumnoParam ?? this.nuevoAlumno;
    console.log(alumno)

    try {
      // Validación básica de campos
      if (!alumno.nombre || !alumno.apellido || !alumno.Estatus || !alumno.autorizadas || !alumno.salon) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      // Validación de imagen obligatoria
      if (!alumno.foto && !nuevoAlumnoParam) {
        await this.presentAlert('Debes subir una foto para continuar.');
        return; // No continuar si no hay imagen
      }

      const data = {
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        Estatus: alumno.Estatus,
        persona_autorizadas: alumno.autorizadas,
        salon: alumno.salon
      };

      // 1. Primero subir la imagen si existe
      let fileId: number | null = null;
      if (alumno.foto) {
        try {
          const uploadRes = await this.api.uploadFile(this.token, alumno.foto);
          fileId = uploadRes.data[0].id;
        } catch (uploadError) {
          console.error('Error subiendo foto:', uploadError);
          await this.presentAlert('Error al subir la foto. Por favor intente nuevamente.');
          return; // Salir si hay error al subir la imagen
        }
      }

      // 2. Crear el alumno
      const createRes = await this.api.postAlum(data, this.token);
      const alumnoId = createRes.data.data.documentId;

      // 3. Asociar la imagen si se subió correctamente
      if (fileId) {
        try {
          await this.api.imagenAlum(this.token, alumnoId, fileId);
        } catch (linkError) {
          console.error('Error asociando foto:', linkError);
          await this.presentAlert('Error al asociar la foto al alumno.');
          // No hacemos return aquí porque el alumno ya fue creado
        }
      }

      // Éxito - limpiar y cerrar
      this.limpiarFormulario();
      this.modal.dismiss();
      await this.getAlumnos(undefined, true);

    } catch (error) {
      console.error('Error al agregar alumno:', error);
      if (!nuevoAlumnoParam) {
        await this.presentAlert('Ocurrió un error al agregar el alumno. Por favor intente nuevamente.');
      }
      // No cerramos el modal aquí para que el usuario pueda corregir los errores
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

  async addAut(nuevoAutorizadaParam?: any) {
    const autorizada = nuevoAutorizadaParam ?? this.nuevoAutorizado;
    console.log('estos son los datos con foto', this.nuevoAutorizado)

    try {
      if (!autorizada.nombre || !autorizada.apellido || !autorizada.estatus || !autorizada.direccion || !autorizada.telefono) {
        await this.presentAlert('Por favor, llena todos los datos.');
        return;
      }

      const data = {
        nombre: autorizada.nombre,
        apellidos: autorizada.apellido,
        telefono: autorizada.telefono,
        Domicilio: autorizada.direccion,
        estatus: autorizada.estatus,
      };

      const createRes = await this.api.postAut(data, this.token);
      const autorizadaId = createRes.data.data.documentId;

      if (autorizada.foto) {
        try {
          const uploadRes = await this.api.uploadFileAut(this.token, autorizada.foto);
          const fileId = uploadRes.data[0].id;

          await this.api.imagenAut(this.token, autorizadaId, fileId);
        } catch (uploadError) {
          console.error('Error subiendo o ligando foto:', uploadError);
          await this.presentAlert('Error al subir o ligar la foto.');
          return; // Detenemos la función si falla la imagen
        }
      } else {
        if (!nuevoAutorizadaParam) await this.presentAlert('Debes subir una foto para continuar.');
        return;
      }



      // Seleccionar automáticamente en el modal principal
      if (!this.nuevoAlumno.autorizadas) {
        this.nuevoAlumno.autorizadas = [];
      }
      this.nuevoAlumno.autorizadas.push(autorizadaId); // Agregar el nuevo ID

      // Cerrar solo el modal secundario
      this.modalAutorizada.dismiss();

      // Limpiar formulario si es necesario
      if (!nuevoAutorizadaParam) {
        this.nuevoAutorizado = {
          nombre: '',
          apellido: '',
          telefono: '',
          direccion: '',
          estatus: true,
          foto: null
        };
      }


      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.modalAutorizada.dismiss();
      this.nuevoAlumno.autorizadas = [...this.nuevoAlumno.autorizadas]; // Crear nuevo array
      await this.getAutorizadas(); // Actualizar lista completa

    } catch (error) {
      console.error('Error al agregar alumno:', error);
      if (!nuevoAutorizadaParam) await this.presentAlert('Ocurrió un error al agregar el alumno.');
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
      this.modalDocente.dismiss();
      this.nuevoAlumno.docente = docenteId;
      this.nuevoAlumno = { ...this.nuevoAlumno }; // Forzar detección de cambios
      await this.getdocentes(); // Actualizar lista completa

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

  async addSalon(nuevoSalonParam?: any) {
    const salon = nuevoSalonParam ?? this.nuevoSalon;
    console.log(salon)

    try {
      if (!salon.Numero || !salon.estado || !salon.alumnos) {
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
      this.modal.dismiss();
      await this.getSalones();

    } catch (error) {
      console.error('Error al agregar el docente:', error);
      if (!nuevoSalonParam) {
        await this.presentAlert('Ocurrió un error al agregar el docente.');
      }
    }
  }

  limpiarFormulario() {
    this.nuevoAlumno = {
      nombre: '',
      apellido: '',
      Estatus: true,
      foto: null,
      autorizadas: [],
      docente: [],
      salon: []
    };
  }

  mostrarFormulario = false;

  nuevoAlumno: any = {
    nombre: '',
    apellido: '',
    Estatus: true,
    foto: null,
    autorizadas: [],
    docente: [],
    salon: []
  };


  nuevoAutorizado: any = {
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    estatus: true,
    foto: null
  };

  nuevoDocente: any = {
    nombre: '',
    apellido: '',
    estatus: true,
    foto: null
  };


  nuevoSalon: any = {
    Numero: '',
    estado: true,
    docente: [],
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
