// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ApplicationRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import { Platform, NavController } from 'ionic-angular';
import { AlertProvider } from '../../providers/alert/alert';
import { LoadingProvider } from '../../providers/loading/loading';
import { CartPage } from '../cart/cart';
import { SearchPage } from '../search/search';
import { SettingsPage } from '../settings/settings';



@Component({
  selector: 'page-my-account',
  templateUrl: 'my-account.html',
})
export class MyAccountPage {
  myAccountData: { [k: string]: any } = {};
  password = '';
  constructor(
    public http: Http,
    public config: ConfigProvider,
    public shared: SharedDataProvider,
    public translate: TranslateService,
    public platform: Platform,
    public navCtrl: NavController,
    public alert: AlertProvider,
    public applicationRef: ApplicationRef,
    public loading: LoadingProvider) {
  }

  //============================================================================================  
  //function updating user information
  updateInfo = function () {
    this.loading.show();
    if (this.password != '') this.myAccountData.password = this.password;
    this.config.Woocommerce.putAsync("customers/" + this.shared.customerData.id, this.myAccountData).then((data) => {
      this.loading.hide();
      this.shared.login(JSON.parse(data.body));
      this.applicationRef.tick();
      this.navCtrl.setRoot(SettingsPage);
      this.shared.toast("Data Updated!");
    }, (err) => { this.shared.toast("Error Updating Data!"); });
  }


  ionViewWillEnter() {
    this.myAccountData.first_name = this.shared.customerData.first_name;
    this.myAccountData.last_name = this.shared.customerData.last_name;
  }
  openCart() {
    this.navCtrl.push(CartPage);
  }
  openSearch() {
    this.navCtrl.push(SearchPage);
  }
}
