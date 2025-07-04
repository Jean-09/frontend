import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular'
import axios, { AxiosHeaders } from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = environment.urlapi;

  constructor(private storage: Storage) {
    this.storage.create()
  }
  // Inicio de sesión

  async login(data: any) {
    console.log(data)
    const res = await axios.post(this.url + '/auth/local', data);
    return res.data.jwt;
  }

  // CRUD de alumnos
  async getAlum(token: string, pagina: number = 1, porPagina: number = 20) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const start = (pagina - 1) * porPagina;
    const url = `${this.url}/alumnos?populate=*&pagination[limit]=${porPagina}&pagination[start]=${start}`;
    const res = await axios.get(url, { headers: options });
    return res.data.data;
  }


  async postAlum(data: any, token: string) {
    console.log(data);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/alumnos', { data: data }, { headers: options });
  }

  // subir imagen si el alumno creado tiene
  uploadFile(token: string, file: File) {
    const formData = new FormData();
    formData.append('files', file);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    return axios.post(this.url + '/upload/', formData, { headers: options });
  }

  // subir imagen al alumno (foto debe ser array)
  imagenAlum(token: string, alumnoId: string, fileId: number) {
    console.log('Id del alumno a ligar', alumnoId);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    const body = { foto: [fileId] };
    return axios.put(this.url + `/alumnos/${alumnoId}`, { data: body }, { headers: options });
  }


  // Update datos alumno
  async putAlum(id: string, data: any, token: string) {
    console.log('Actualizando alumno:', id, data);
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/alumnos/${id}`, { data: data }, { headers: options });
  }

  // Delete alumnos
  delAlumno(a: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/alumnos/' + a.documentId, { data: { Estatus: datosActualizados } }, { headers: options });

  }
  // CRUD de docentes
  async getDoce(token: string) {
    console.log(token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url + '/docentes?populate=foto', { headers: options });
    return res.data.data;

  }

  // Delete Docentes
  delDocente(d: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/docentes/' + d.documentId, { data: { estatus: datosActualizados } }, { headers: options });

  }




  // CRUD de personas autorizadas
  async getAut(token: string) {
    console.log(token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url + '/persona-autorizadas?populate=foto', { headers: options });
    return res.data.data
  }

  delAut(p: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/persona-autorizadas/' + p.documentId, { data: { estatus: datosActualizados } }, { headers: options });

  }

  // CRUD de salones
  async getSalon(token: string) {
    console.log(token)
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url + '/salons?populate=docente', { headers: options });
    return res.data.data
  }

  delsalon(s: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/salons/' + s.documentId, { data: { estado: datosActualizados } }, { headers: options });

  }
}
