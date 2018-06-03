// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { MyOrdersPage } from '../my-orders/my-orders';
import { CartPage } from '../cart/cart';
import { SearchPage } from '../search/search';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { Home2Page } from '../home2/home2';
import { Home3Page } from '../home3/home3';
import { Home5Page } from '../home5/home5';
import { Home4Page } from '../home4/home4';
import { ConfigProvider } from '../../providers/config/config';




@Component({
  selector: 'page-thank-you',
  templateUrl: 'thank-you.html',
})
export class ThankYouPage {
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataProvider,
    public config: ConfigProvider,
    public navParams: NavParams) {

  }
  openHome() {
    if (this.config.homePage == 1) { this.navCtrl.setRoot(HomePage); }
    if (this.config.homePage == 2) { this.navCtrl.setRoot(Home2Page); }
    if (this.config.homePage == 3) { this.navCtrl.setRoot(Home3Page); }
    if (this.config.homePage == 4) { this.navCtrl.setRoot(Home4Page); }
    if (this.config.homePage == 5) { this.navCtrl.setRoot(Home5Page); }
  }
  openOrders() { this.navCtrl.setRoot(MyOrdersPage); }

  ionViewDidLoad() {
    this.shared.orderComplete();
  }
  openCart() {
    this.navCtrl.push(CartPage);
  }
  openSearch() {
    this.navCtrl.push(SearchPage);
  }
  ionViewWillEnter() {
    if (this.config.admob == 1) this.shared.showAd();
  }
}
