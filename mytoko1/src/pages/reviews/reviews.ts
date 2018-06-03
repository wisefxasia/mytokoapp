import { Component, ApplicationRef } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { AddReviewPage } from '../add-review/add-review';
import { LoadingProvider } from '../../providers/loading/loading';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { LoginPage } from '../login/login';

/**
 * Generated class for the ReviewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-reviews',
  templateUrl: 'reviews.html',
})
export class ReviewsPage {
  reviews = [];
  id;
  average;
  r1 = null;
  r2 = null;
  r3 = null;
  r4 = null;
  r5 = null;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private applicationRef: ApplicationRef,
    public config: ConfigProvider,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    public shared: SharedDataProvider, ) {
    this.id = navParams.get('id');
    this.getProductReviews();

  }


  //===============================================================================================================================
  // <!-- 2.0 updates -->
  getProductReviews() {
    this.loading.show();
    this.config.Woocommerce.getAsync("products/" + this.id + "/reviews").then(data => {
      this.reviews = JSON.parse(data.body);
      this.applicationRef.tick();
      let total = 0;
      for (let value of this.reviews) {
        total = total + value.rating;
      }
      this.average = (total / this.reviews.length);
      if (this.reviews.length == 0) this.average = 0;
      this.calculateAll();
      this.applicationRef.tick();
      this.loading.hide();

    });
  }
  //===============================================================================================================================
  // <!-- 2.0 updates -->
  openReviewsPage() {
    if (this.shared.customerData.id == null || this.shared.customerData.id == undefined) {
      let modal = this.modalCtrl.create(LoginPage, { hideGuestLogin: true });// <!-- 2.0 updates -->
      modal.present();
    }
    else
      this.navCtrl.push(AddReviewPage, { id: this.id });
  }
  //===============================================================================================================================
  // <!-- 2.0 updates -->
  totalRating() {
    let total = 0;
    for (let value of this.reviews) {
      total = total + value.rating;
    }

    let result = total;
    if (total == 0) result = 0;
    return result;
  }
  calculateAll() {
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;
    let total = this.reviews.length;
    for (let value of this.reviews) {
      if (value.rating == 1) r1++;
      if (value.rating == 2) r2++;
      if (value.rating == 3) r3++;
      if (value.rating == 4) r4++;
      if (value.rating == 5) r5++;
    }
    this.r1 = (100 / total) * r1; if (r1 == 0) this.r1 = 0;
    this.r2 = (100 / total) * r2; if (r2 == 0) this.r2 = 0;
    this.r3 = (100 / total) * r3; if (r3 == 0) this.r3 = 0;
    this.r4 = (100 / total) * r4; if (r4 == 0) this.r4 = 0;
    this.r5 = (100 / total) * r5; if (r5 == 0) this.r5 = 0;
  }
}
