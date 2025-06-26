import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular'

import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = environment.urlapi;

  constructor(private http: HttpClient, private storage: Storage) {
    this.storage.create()
  }
  // Inicio de sesión

  login(data: any) {
    console.log(data)
    return this.http.post(this.url + '/auth/local', data);
  }

  // CRUD de alumnos
  getAlum(token: string) {
    console.log(token)
    let options = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get(this.url + '/alumnos?populate=foto', { headers: options });
  }
  // Create productos
  postAlum(data: any, token: string) {
    let options = new HttpHeaders({ 
      'Authorization': 'Bearer ' + token 
    });
    return this.http.post(this.url + '/alumnos', { data: data }, { headers: options });
  }

  // subir imagen si el alumno creado tiene
  uploadFile(token: string, file: File) {
    const formData = new FormData();
    formData.append('files', file);
    let options = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    return this.http.post(this.url + '/upload/', formData, { headers: options });
  }

  // subir imagen al alumno
  imagenAlum(token: string, alumnoId: string, fileId: number) {
    let options = new HttpHeaders({ 'Authorization': 'Bearer ' + token });
    const body = { foto: fileId };
    return this.http.put(this.url + `/alumnos/${alumnoId}`, { data: body }, { headers: options });
  }

  // Update datos alumno
  updateAlum(a: any, d: any, token: string) {
    let options = new HttpHeaders({ 
      'Authorization': 'Bearer ' + token 
    });
    return this.http.put(this.url + '/alumnos/' + a.documentId, { data: { nombre: d.nombre, apellido: d.apellido, persona_autorizada: a.autorizadas } }, { headers: options })
  }

  // Delete alumnos
  delAlumno(a: any, datosActualizados: any, token: string) {
    let options = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.put(this.url + '/alumnos/' + a.documentId, { data: { Estatus: datosActualizados } }, { headers: options });

  }
  // CRUD de docentes
  getDoce(token: string) {
    console.log(token)
    let options = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get(this.url + '/docentes?populate=foto', { headers: options });
  }

  


  // CRUD de personas autorizadas
  getAut(token: string) {
    console.log(token)
    let options = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get(this.url + '/persona-autorizadas?populate=foto', { headers: options });
  }

  // CRUD de salones
  getSalon(token: string) {
    console.log(token)
    let options = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get(this.url + '/salons?populate=docente', { headers: options });
  }
}
