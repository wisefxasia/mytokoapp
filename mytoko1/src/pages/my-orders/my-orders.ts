// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ViewChild, ApplicationRef } from '@angular/core';
import { NavController, NavParams, InfiniteScroll } from 'ionic-angular';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { TranslateService } from '@ngx-translate/core';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { LoadingProvider } from '../../providers/loading/loading';
import { AlertProvider } from '../../providers/alert/alert';
import { OrderDetailPage } from '../order-detail/order-detail';
import { CartPage } from '../cart/cart';
import { SearchPage } from '../search/search';
import { ProductsPage } from '../products/products';


@Component({
  selector: 'page-my-orders',
  templateUrl: 'my-orders.html',
})
export class MyOrdersPage {

  @ViewChild(InfiniteScroll) infinite: InfiniteScroll;
  page = 1;
  orders = new Array;
  httpRunning = true;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public config: ConfigProvider,
    public shared: SharedDataProvider,
    translate: TranslateService,
    public alert: AlertProvider,
    public loading: LoadingProvider,
    private applicationRef: ApplicationRef
  ) {
  }
  getOrders() {
    this.httpRunning = true;
    if (this.page == 1) { this.loading.show(); }

    this.config.Woocommerce.getAsync('orders/?' + 'page=' + this.page + "&customer=" + this.shared.customerData.id).then((dat) => {
      this.infinite.complete();
      this.httpRunning = false;
      let data = JSON.parse(dat.body);

      if (this.page == 1) { this.orders = new Array; this.loading.hide(); }
      if (data.length != 0) {
        this.page++;
        for (let value of data) {
          this.orders.push(value);
        }
      }

      if (data.length == 0) { this.infinite.enable(false); }

      this.applicationRef.tick();
    }, err => {
      this.loading.hide();
      this.alert.show("Server Error while Loading Orders");
    });
  };
  get
  showOrderDetail(order) {

    this.navCtrl.push(OrderDetailPage, { 'data': order });

  }
  ionViewDidLoad() {
    this.httpRunning = true;
    this.getOrders();
  }
  openCart() {
    this.navCtrl.push(CartPage);
  }
  openSearch() {
    this.navCtrl.push(SearchPage);
  }
  openShop() {
    this.navCtrl.push(ProductsPage);
  }
}
