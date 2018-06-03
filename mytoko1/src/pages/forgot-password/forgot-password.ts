// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { LoadingProvider } from '../../providers/loading/loading';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { AlertProvider } from '../../providers/alert/alert';

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  formData = {
    customers_email_address: '',
  };
  errorMessage = '';
  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public loading: LoadingProvider,
    public http: Http,
    public config: ConfigProvider,
    public alert: AlertProvider,
    public navParams: NavParams) {
  }
  forgetPassword() {
    this.loading.show();
    this.errorMessage = '';
    this.http.get(this.config.url + '/api/appusers/forgot_password/?insecure=cool&email=' + this.formData.customers_email_address).map(res => res.json()).subscribe(data => {
      this.loading.hide();
      console.log(data);

      this.alert.show(data);
      this.dismiss();

    }, error => {
      this.loading.hide();
      this.errorMessage = "The Email not Valid exist";
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
