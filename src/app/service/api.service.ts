import { Injectable } from '@angular/core';
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
  // crear usuarios
  async postUser(user: any, token: string) {
    console.log('Usuario regitrado', user);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/auth/local/register', { username: user.username, email: user.email, password: user.password }, { headers: options });
  }
async postUserAutorizado(user: any, token: string) {
    console.log('Usuario a registrar', user);
    
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    try {
      // 1. Registrar el usuario
      console.log('Creando usuario...');
      const registerResponse = await axios.post(
        `${this.url}/auth/local/register`, 
        {
          username: user.username,
          email: user.email,
          password: user.password
        }, 
        options
      );

      const newUser = registerResponse.data.user;
      console.log('Usuario creado con ID:', newUser.id);

      // 2. Buscar el rol "Persona Autorizada"
      console.log('Buscando rol "Persona Autorizada"...');
      const rolesResponse = await axios.get(
        `${this.url}/users-permissions/roles`,
        options
      );

      const roles = rolesResponse.data.roles;
      const personaAutorizadaRole = roles.find((role: any) => 
        role.name.toLowerCase() === 'persona_autorizada'
      );

      if (!personaAutorizadaRole) {
        throw new Error('Rol "Persona Autorizada" no encontrado');
      }

      console.log('ID del rol encontrado:', personaAutorizadaRole.id);

      // 3. Actualizar el usuario con el rol
      console.log('Actualizando usuario con el rol...');
      const updateResponse = await axios.put(
        `${this.url}/users/${newUser.id}`,
        {
          role: personaAutorizadaRole.id
        },
        options
      );
       console.log('datos que regresan',registerResponse.data)

      console.log('Usuario actualizado exitosamente');
      return registerResponse.data;
     

    } catch (error) {
      console.error('Error en el proceso completo:', error);
      throw error; // Puedes manejar este error según tus necesidades
    }
  }


  async deltUser(userId: any, token: string) {
    console.log(userId);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/users' + userId, { headers: options });
  }

  // Inicio de sesión

  async login(data: any) {
    console.log(data)
    const res = await axios.post(this.url + '/auth/local', data);
    return res.data.jwt;
  }

  // CRUD de alumnos
  async getAlum(token: string, pagina: number = 1, porPagina: number = 15) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const start = (pagina - 1) * porPagina;
    const url = `${this.url}/alumnos?populate[foto]=true&populate[docente][populate][0]=foto&populate[persona_autorizadas][populate][0]=foto&populate[llegada][populate][docente][populate]=foto&&populate[llegada][populate][alumno][populate]=foto&populate[llegada][populate][persona_autorizada][populate]=foto&populate[salon][populate][docente][populate]=foto&pagination[limit]=${porPagina}&pagination[start]=${start}`;
    const res = await axios.get(url, { headers: options });
    return res.data.data;
  }  
  async getAllAlum(token: string) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    const res = await axios.get(this.url+ '/alumnos?pagination[limit]=-1&populate[foto]=true&pagination[limit]=-1&populate=*populate[docente][populate][0]=foto&populate[persona_autorizadas][populate][0]=foto&populate[llegada][populate][docente][populate]=foto&&populate[llegada][populate][alumno][populate]=foto&populate[llegada][populate][persona_autorizada][populate]=foto&populate[salon][populate][docente][populate]=foto' , { headers: options });
    return res.data.data;
  }


async postAlum(data: any, token: string) {
  const options = {
    headers: { 'Authorization': `Bearer ${token}` }
  };
  console.log('este es lo que llega', data)

  try {
    if (data.salon) {
      console.log(data)
      const response = await axios.get(`${this.url}/salons/${data.salon}?populate=docente`, options);
      const docenteId = response.data.data.docente?.documentId;

      if (docenteId) {
        data.docente = docenteId;
      }
    }
    return await axios.post(`${this.url}/alumnos`, { data }, options);

  } catch (error) {
    console.error('Error al crear alumno:', error);
    throw error;
  }
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


 // Agrega este método para obtener información de salón con docente
async getSalonbyid(salonId: string, token: string) {
  const options = new AxiosHeaders({
    'Authorization': 'Bearer ' + token
  });
  return axios.get(`${this.url}/salons/${salonId}?populate=docente`, { headers: options });
}

// Método actualizado para actualizar alumno
async putAlum(id: string, data: any, token: string) {
  const options = new AxiosHeaders({
    'Authorization': 'Bearer ' + token
  });
  return axios.put(`${this.url}/alumnos/${id}`, { data }, { headers: options });
}

  // Delete alumnos
  delAlumno(a: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/alumnos/' + a.documentId, { data: { Estatus: datosActualizados } }, { headers: options });

  }

  // CRUD de docentes
  async getDoce(token: string, pagina: number = 1, porPagina: number = 20) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const start = (pagina - 1) * porPagina;
    const url = `${this.url}/docentes?populate[foto]=true&populate[alumnos][populate][0]=foto&populate[user][populate]=*&populate[salon][populate]=*&pagination[limit]=${porPagina}&pagination[start]=${start}`;
    const res = await axios.get(url, { headers: options });
    return res.data.data;
  }  

  
  async getAllDoce(token: string) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url +'/docentes?populate[foto]=true&populate[alumnos][populate][0]=foto&populate[user][populate]=*&populate[salon][populate]=*', { headers: options });
    return res.data.data;
  }
  async getAllLlegadas(token: string) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url +'/llegadas?populate[alumno][populate][0]=foto&populate[docente][populate][0]=foto&populate[persona_autorizada][populate][0]=foto', { headers: options });
    return res.data.data;
  }

  async postDoce(data: any, token: string) {
    console.log(' datos enviados de docentes', data);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/docentes', { data: data }, { headers: options });
  }

  // subir imagen si el alumno creado tiene
  uploadFileDoce(token: string, file: File) {
    const formData = new FormData();
    formData.append('files', file);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    return axios.post(this.url + '/upload/', formData, { headers: options });
  }

  // subir imagen al alumno (foto debe ser array)
  imagenDoce(token: string, docenteId: string, fileId: number) {
    console.log('Id del docente a ligar', docenteId);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    const body = { foto: [fileId] };
    return axios.put(this.url + `/docentes/${docenteId}`, { data: body }, { headers: options });
  }

  // Update datos alumno
  async putDoce(id: string, data: any, token: string) {
    console.log('Actualizando alumno:', id, data);
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/docentes/${id}`, { data: data }, { headers: options });
  }

  // Delete Docentes
  delDocente(d: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/docentes/' + d.documentId, { data: { estatus: datosActualizados } }, { headers: options });

  }

  GetDocent(query: string, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = axios.put(`${this.url}docentes?_q=${encodeURIComponent(query)}`, { headers: options });
    return res;

  }



  // CRUD de personas autorizadas
  async getAut(token: string, pagina: number = 1, porPagina: number = 5) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const start = (pagina - 1) * porPagina;
    const url = `${this.url}/persona-autorizadas?populate[foto]=true&populate[alumnos][populate][0]=foto&pagination[limit]=${porPagina}&pagination[start]=${start}`;
    const res = await axios.get(url, { headers: options });
    return res.data.data;
  }  

  async getAllAut(token: string) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url +'/persona-autorizadas?populate[foto]=true&populate[alumnos][populate][0]=foto', { headers: options })
    return res.data.data
  }

  async postAut(data: any, token: string) {
    console.log(data);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/persona-autorizadas', { data: data }, { headers: options });
  }

  // subir imagen si el alumno creado tiene
  uploadFileAut(token: string, file: File) {
    const formData = new FormData();
    formData.append('files', file);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    return axios.post(this.url + '/upload/', formData, { headers: options });
  }

  imagenAut(token: string, autorizadaId: string, fileId: number) {
    console.log('Id del docente a ligar', autorizadaId);
    let options = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });
    const body = { foto: [fileId] };
    return axios.put(this.url + `/persona-autorizadas/${autorizadaId}`, { data: body }, { headers: options });
  }

  async putAut(id: string, data: any, token: string) {
    console.log('Actualizando alumno:', id, data);
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/persona-autorizadas/${id}`, { data: data }, { headers: options });
  }

  delAut(p: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/persona-autorizadas/' + p.documentId, { data: { estatus: datosActualizados } }, { headers: options });

  }

  buscarPeAut(query: string, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/api/persona-autorizadas?_q=${encodeURIComponent(query)}`, { headers: options });
  }

  // CRUD de salones
  async getSalon(token: string, pagina: number = 1, porPagina: number = 20) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const start = (pagina - 1) * porPagina;
    const url = `${this.url}/salons?populate[alumnos][populate][0]=foto&populate[docente][populate][0]=foto&pagination[limit]=${porPagina}&pagination[start]=${start}`;
    const res = await axios.get(url, { headers: options });
    return res.data.data;
  }  
  async getAllSalon(token: string) {
    console.log(token);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    const res = await axios.get(this.url+'/salons?populate[alumnos][populate][0]=foto&populate[docente][populate][0]=foto', { headers: options });
    return res.data.data;
  }


  async postSalon(data: any, token: string) {
    console.log(' datos enviados de Salones', data);
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.post(this.url + '/salons', { data: data }, { headers: options });
  }

  async putSalon(id: string, data: any, token: string) {
    console.log('Actualizando alumno:', id, data);
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(`${this.url}/salons/${id}`, { data: data }, { headers: options });
  }


  delsalon(s: any, datosActualizados: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/salons/' + s.documentId, { data: { estado: datosActualizados } }, { headers: options });

  }
}
