import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.page.html',
  styleUrls: ['./docente.page.scss'],
  standalone: false
})
export class DocentePage implements OnInit {

  constructor(private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getDocentes();

  }

  docentes: any[]=[];
  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  getDocentes() {
    this.api.getDoce(this.token).then((res) => {
        this.docentes = res;
        console.log(this.docentes);
      }).catch((error)=>{

        console.log(error);

      })

  }

  borrar(id:any){

  }

  update(){

  }

    toggleStatus(d: any) {
    const nuevoEstado = !d.estatus;

    this.api.delDocente(d, nuevoEstado, this.token).then((res) => {
      console.log('Estado cambiado:', res);
      d.estatus = nuevoEstado;
      this.getDocentes();
    }).catch((error) => {
      console.error('Error al cambiar estado:', error);
    });
  }

    async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }

  

}

