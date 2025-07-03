import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-salon',
  templateUrl: './salon.page.html',
  styleUrls: ['./salon.page.scss'],
  standalone: false
})
export class SalonPage implements OnInit {

  constructor(private api: ApiService, private storage: Storage, private route: Router) { }

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getSalon();

  }

  salon: any[] = [];
  token = '';

  async getToken() {
    this.token = await this.storage.get('token');
    if (!this.token) {
      this.route.navigate(['/login']);
    }
  }

  getSalon() {
    this.api.getSalon(this.token).then((res) => {
        this.salon = res;
        console.log(this.salon);
      }).catch((error)=>{

        console.log(error);

      })
  }


  borrar(id: any) {

  }

  update() {

  }
}
