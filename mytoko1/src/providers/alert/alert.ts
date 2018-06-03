import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';



@Injectable()
export class AlertProvider {
  okText = "ok";
  alertText = "Alert";
  constructor(
    public alertCtrl: AlertController,
    public translate: TranslateService,
  ) {

  }
  show(text) {
    this.translate.get([text, "ok", "Alert"]).subscribe((res) => {
      let alert = this.alertCtrl.create({
        title: res["Alert"],
        subTitle: res[text],
        buttons: [res["ok"]]
      });
      alert.present();
    });
  }

  showWithTitle(text, title) {
    this.translate.get([text, "ok", title]).subscribe((res) => {
      let alert = this.alertCtrl.create({
        title: res[title],
        subTitle: res[text],
        buttons: [res["ok"]]
      });
      alert.present();
    });
  }
}
