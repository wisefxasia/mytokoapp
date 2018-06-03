// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import { LoadingProvider } from '../../providers/loading/loading';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { SelectCountryPage } from '../select-country/select-country';
import { SelectZonesPage } from '../select-zones/select-zones';
import { BillingAddressPage } from '../billing-address/billing-address';
import { LocationDataProvider } from '../../providers/location-data/location-data';


@Component({
  selector: 'page-shipping-address',
  templateUrl: 'shipping-address.html',
})
export class ShippingAddressPage {


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public config: ConfigProvider,
    public http: Http,
    public shared: SharedDataProvider,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    public location: LocationDataProvider) {

    if (this.shared.customerData.id != null) {
      this.shared.shipping = this.shared.customerData.shipping;
      this.shared.shippingCountryName = this.location.getCountryName(this.shared.customerData.shipping.country);
      this.shared.shippingStateName = this.location.getStateName(this.shared.customerData.shipping.country, this.shared.customerData.shipping.state);
    }
    //this.getAllTaxRates(1);
  }
  submit() {
    this.navCtrl.push(BillingAddressPage);
  }
  selectCountryPage() {
    let modal = this.modalCtrl.create(SelectCountryPage, { page: 'shipping' });
    modal.present();
  }
  selectZonePage() {
    let modal = this.modalCtrl.create(SelectZonesPage, { page: 'shipping' });
    modal.present();
  }
  getAllTaxRates(page) {
    this.config.Woocommerce.getAsync("taxes/?per_page=100&page=" + page).then((data) => {
      var dat = JSON.parse(data.body);
      for (let val of dat) {
        this.shared.listTaxRates.push(val);
      }
      if (dat.length != 0) { this.getAllTaxRates(page + 1); }
      //else console.log(this.shared.listTaxRates);
    });
  }
}
