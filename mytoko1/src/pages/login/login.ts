// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ApplicationRef } from '@angular/core';
import { ViewController, ModalController, NavController, NavParams, Events } from 'ionic-angular';
import { SignUpPage } from '../sign-up/sign-up';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { LoadingProvider } from '../../providers/loading/loading';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AlertProvider } from '../../providers/alert/alert';
import { GooglePlus } from '@ionic-native/google-plus';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',

})
export class LoginPage {
  hideGuestLogin = false;
  formData = { username: '', password: '' };
  errorMessage = '';
  constructor(
    public http: Http,
    public config: ConfigProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    public shared: SharedDataProvider,
    private fb: Facebook,
    public alert: AlertProvider,
    private googlePlus: GooglePlus,
    private applicationRef: ApplicationRef,
    public navCtrl: NavController,
    public events: Events,
    public navParams: NavParams,
  ) {
    this.hideGuestLogin = navParams.get('hideGuestLogin');
  }
  // <!-- 2.0 updates -->
  guestLogin() {
    if (this.config.checkOutPage == 1)
      this.shared.onePageCheckOut();
    else
      this.events.publish('openShippingAddressPage');

    this.dismiss();
  }

  login() {
    this.loading.show();
    this.errorMessage = '';
    this.http.get(this.config.url + '/api/appusers/generate_cookie/?insecure=cool&username=' + this.formData.username + "&password=" + this.formData.password).map(res => res.json()).subscribe(data => {
      if (data.status == "ok")
        this.getUserData(data, "simple");
      else {
        this.errorMessage = data.error;
        this.loading.hide();
      }
    }, err => {
      this.loading.hide();
      if (err.ok == false) {
        this.errorMessage = "Invalid Username or Password";
      }
    });
    // this.config.Woocommerce.getAsync("customers/" + 118).then((data) => {
    //   this.loading.hide();
    //   this.shared.login(JSON.parse(data.body));
    //   //console.log(this.shared.customerData);
    //   this.dismiss();
    //   this.applicationRef.tick();
    // });
  }
  getUserData(c, type) {
    let id;
    if (type == "simple") id = c.user.id;
    if (type == "fb") id = c.id;
    //alert(c.user.id + " -- " + c.id + " --- " + id);
    this.config.Woocommerce.getAsync("customers/" + id).then((data) => {
      this.loading.hide();
      let dat = JSON.parse(data.body);
      //alert(JSON.stringify(dat));
      this.shared.login(Object.assign({ cookie: c.cookie }, dat));
      // alert(JSON.stringify(Object.assign({ cookie: c.cookie }, dat)));
      this.dismiss();
      this.applicationRef.tick();
    });
  }
  openSignUpPage() {
    let modal = this.modalCtrl.create(SignUpPage);
    modal.present();
    this.dismiss();
  }
  openForgetPasswordPage() {
    let modal = this.modalCtrl.create(ForgotPasswordPage);
    modal.present();
  }

  facebookLogin() {
    this.fb.getLoginStatus().then((res: any) => {
      if (res.status == 'connected') {
        console.log("user connected already" + res.authResponse.accessToken);
        this.createAccount(res.authResponse.accessToken, 'fb');

      }
      else {
        console.log("USer Not login ");
        this.fb.login(['public_profile', 'user_friends', 'email'])
          .then((res: FacebookLoginResponse) => {
            // this.alert.show('Logged into Facebook!' + JSON.stringify(res));
            console.log("successfully login ");
            this.createAccount(res.authResponse.accessToken, 'fb');
          })
          .catch(e => this.alert.show('Error logging into Facebook' + JSON.stringify(e)));
      }
    }).catch(e => this.alert.show('Error Check Login Status Facebook' + JSON.stringify(e)));
  }

  googleLogin() {
    this.loading.autoHide(500);
    this.googlePlus.login({})
      .then(res => {
        //  alert(JSON.stringify(res))
        this.createAccount(res, 'google');
      })
      .catch(err => this.alert.show(JSON.stringify(err)));
  }
  //============================================================================================  
  //creating new account using function facebook or google details 
  createAccount(info, type) {
    //this.formData.username = info;
    // alert(info);
    this.loading.show();
    var url = '';
    url = '/api/appusers/fb_connect/?insecure=cool&access_token=' + info;


    this.http.get(this.config.url + url).map(res => res.json()).subscribe(data => {
      this.loading.hide();
      //alert(JSON.stringify(data));
      this.getUserData(data, "fb");

    }, error => {
      this.loading.hide();
      //this.alert.show("error " + JSON.stringify(error));
    });
  };
  //close modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}
