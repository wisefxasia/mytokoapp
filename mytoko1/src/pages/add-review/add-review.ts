import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { LoadingProvider } from '../../providers/loading/loading';

@Component({
  selector: 'page-add-review',
  templateUrl: 'add-review.html',
})
export class AddReviewPage {
  rating = null;
  nonce;
  errorMessage = '';
  id;
  formData = { name: '', email: '', description: '' };

  ratingStars = [
    { value: '1', fill: 'star-outline' },
    { value: '2', fill: 'star-outline' },
    { value: '3', fill: 'star-outline' },
    { value: '4', fill: 'star-outline' },
    { value: '5', fill: 'star-outline' }
  ];
  constructor(
    public navCtrl: NavController,
    public http: Http,
    public config: ConfigProvider,
    public navParams: NavParams,
    public loading: LoadingProvider,
    public shared: SharedDataProvider,
  ) {
    this.id = navParams.get('id');
    this.getNonce();
    this.formData.name = this.shared.customerData.first_name + " " + this.shared.customerData.last_name;
    this.formData.email = this.shared.customerData.email;
  }
  getNonce() {
    this.loading.show();
    this.http.get(this.config.url + "/api/get_nonce/?controller=AppSettings&method=create_product_review").map(res => res.json()).subscribe(data => {
      this.nonce = data.nonce;
      console.log(data);
      this.loading.hide();
    });
  }
  addComment() {
    this.loading.show();
    this.http.get(this.config.url + "/api/appsettings/create_product_review/?insecure=cool&nonce="
      + this.nonce
      + "&author_name=" + this.formData.name
      + "&author_email=" + this.formData.email
      + "&product_id=" + this.id
      + "&author_content=" + this.formData.description
      + "&rate_star=" + this.rating
      + "&user_id=" + this.shared.customerData.id
    ).map(res => res.json()).subscribe(data => {
      this.loading.hide();
      if (data.status == 'ok') {
        this.navCtrl.pop();
      }
      console.log(data);
    }, err => {
      this.errorMessage = err.message;
    });
  }
  selectRating(value) {
    this.rating = value;
    for (let v of this.ratingStars) {
      if (v.value <= value) v.fill = 'star';
      else v.fill = 'star-outline';
    }
  }
  disbaleButton() {
    if (this.rating == null) { console.log(true); return true; }
    else if (this.formData.description == "") { console.log(true); return true; }
    else if (this.formData.name == "") { console.log(true); return true; }
    else if (this.formData.email == "") { console.log(true); return true; }
    else { console.log(false); return false; }
  }
}
