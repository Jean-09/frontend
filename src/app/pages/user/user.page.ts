import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, IonPopover } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: false
})
export class UserPage implements OnInit {


  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('popover') popover!: IonPopover;
  isMenuOpen = false;

  openMenu(event: Event) {
    this.isMenuOpen = true;
    this.popover.event = event;
  }

  async logout() {
    await this.storage.remove('token');
    this.route.navigate(['/login']);
  }


  constructor(private storage: Storage, private route: Router) { }

  ngOnInit() {
  }

}
