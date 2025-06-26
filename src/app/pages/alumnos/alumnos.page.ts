import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.page.html',
  styleUrls: ['./alumnos.page.scss'],
  standalone: false
})
export class AlumnosPage implements OnInit {

  constructor(private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getAlumnos();
    await this.getAutorizadas();

  }

  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  alumnos: any[] = [];
  autorizadas: any[] = [];

  getAlumnos() {
    console.log('token', this.token)
    this.api.getAlum(this.token).subscribe({
      next: (res: any) => {
        this.alumnos = res.data
        console.log(this.alumnos)
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getAutorizadas() {
    this.api.getAut(this.token).subscribe({
      next: (res: any) => {
        this.autorizadas = res.data;
        console.log(this.autorizadas);
      },
      error: (error: any) => {
        console.log(error);
      }
    })

  }

  seleccionarFoto(event: any) {
    const archivo = event.target.files[0];
    this.nuevoAlumno.foto = archivo;
  }

  borrar(a: any) {
    const datosActualizados = false;


    this.api.delAlumno(a, datosActualizados, this.token).subscribe({
      next: (res) => {
        console.log('Alumno desactivado:', res);
        this.getAlumnos(); // Actualiza la lista después del cambio
      },
      error: (error) => {
        console.error('Error al desactivar:', error);
      }
    });
  }


  update() {
    
  }

  async addAlum() {
    try {
      const data = {
        nombre: this.nuevoAlumno.nombre,
        apellido: this.nuevoAlumno.apellido,
        Estatus: this.nuevoAlumno.Estatus,
        persona_autorizadas: this.nuevoAlumno.autorizadas
      };

      const createRes: any = await this.api.postAlum(data, this.token).toPromise();
      const alumnoId = createRes.data.documentId;

      if (this.nuevoAlumno.foto) {
        const uploadRes: any = await this.api.uploadFile(this.token, this.nuevoAlumno.foto).toPromise();
        await this.api.imagenAlum(this.token, alumnoId, uploadRes[0].id).toPromise();
      }

      this.mostrarFormulario = false;
      this.limpiarFormulario();
      this.getAlumnos();

    } catch (error) {
      console.error(error);
    }
  }

  limpiarFormulario() {
    this.nuevoAlumno = {
      nombre: '',
      apellido: '',
      Estatus: true,
      foto: null,
      autorizadas: []
    };
  }

  mostrarFormulario = false;

  nuevoAlumno = {
    nombre: '',
    apellido: '',
    Estatus: true,
    foto: null,
    autorizadas: []
  };


}
