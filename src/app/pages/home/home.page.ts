import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  constructor(private route: Router, private storage: Storage, private api: ApiService) { }

  async ngOnInit() {
    await this.storage.create()
  }

  token='';

  async getToken(){
    this.token = await this.storage.get('token');
    if(!this.token){
      this.route.navigate(['/login']);
    }
  }

  estu(){
    this.route.navigate(['/alumnos'])
  }

  doce(){
    this.route.navigate(['/docente'])
  }

  persoAut(){
    this.route.navigate(['/autorizadas']);
  }
  salon(){
    this.route.navigate(['/salon']);
  }

}
