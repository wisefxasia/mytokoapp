// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { ConfigProvider } from '../../providers/config/config';
import { NavController, NavParams } from 'ionic-angular';
import { ProductsPage } from '../../pages/products/products';
import { Http } from '@angular/http';
import { LoadingProvider } from '../../providers/loading/loading';
import { ProductDetailPage } from '../../pages/product-detail/product-detail';
import { AlertProvider } from '../../providers/alert/alert';

@Component({
  selector: 'banners',
  templateUrl: 'banners.html'
})
export class BannersComponent {

  constructor(
    public shared: SharedDataProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public config: ConfigProvider,
    public http: Http,
    public loading: LoadingProvider,
    public alert: AlertProvider,
  ) {

  }
  //===============================================================================================
  //on click image banners
  bannerClick = function (image) {
    //  console.log(image);
    if (image.type == 'category') {
      this.navCtrl.push(ProductsPage, { id: parseInt(image.banners_url) });
    }
    else if (image.type == 'product') {
      this.getSingleProductDetail(parseInt(image.banners_url));
    }
    else {
      this.navCtrl.push(ProductsPage, { type: image.type });
    }
  }
  //===============================================================================================
  //getting single product data
  getSingleProductDetail(id) {
    this.loading.show();
    //if (this.type == 'recent' || this.type == 'wishList') {
    this.config.Woocommerce.getAsync("products/" + id).then((data) => {
      //this.alert.show("loaded");
      this.loading.hide();
      this.navCtrl.push(ProductDetailPage, { data: JSON.parse(data.body) });
      this.shared.addToRecent(JSON.parse(data.body));
    }, err => {
      this.loading.hide();

      this.alert.show("Item not Available!");

      console.log(err);
    });
  }
}
