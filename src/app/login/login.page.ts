import { Component, OnInit } from '@angular/core';
import { ApiService } from '../service/api.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  constructor(private api: ApiService, private storage: Storage, private route: Router, private alertController: AlertController) {}

  username="";
  password="";

  async ngOnInit(){
    await this.storage.create();
  }

  login(){
    if (!this.username || !this.password) {
      this.presentAlert('Campos incompletos', 'Por favor, ingresa tu nombre de usuario y contraseña.');
      return; 
    }
    const data = {
      identifier:this.username,
      password: this.password
    }

    this.api.login(data).then( (res:any) =>{
        console.log(res);
        this.storage.set('token', res)
        this.route.navigateByUrl('/home')
      }).catch((error)=>{
        console.log(error);
      })
  }

 
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}

