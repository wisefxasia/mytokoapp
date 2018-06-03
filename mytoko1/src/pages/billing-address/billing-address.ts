// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ApplicationRef } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { SelectCountryPage } from '../select-country/select-country';
import { SelectZonesPage } from '../select-zones/select-zones';
import { ShippingMethodPage } from '../shipping-method/shipping-method';
import { LocationDataProvider } from '../../providers/location-data/location-data';

@Component({
  selector: 'page-billing-address',
  templateUrl: 'billing-address.html',
})
export class BillingAddressPage {
  defaultAddress = false;
  constructor(
    public navParams: NavParams,
    // public config: ConfigProvider,
    //public http: Http,
    public shared: SharedDataProvider,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public location: LocationDataProvider,
    private applicationRef: ApplicationRef,
    // public loading: LoadingProvider, 
  ) {
    if (this.shared.customerData.id != null) {
      this.shared.billing = this.shared.customerData.billing;
      this.shared.billing.email = this.shared.customerData.email;
      this.shared.billingCountryName = this.location.getCountryName(this.shared.customerData.billing.country);
      this.shared.billingStateName = this.location.getStateName(this.shared.customerData.billing.country, this.shared.customerData.billing.state);
    }

  }
  // <!-- 2.0 updates -->
  setAddress(value) {
    if (this.defaultAddress == false) this.defaultAddress = true;
    else this.defaultAddress = false;
    this.shared.sameAddress = this.defaultAddress;
    console.log(this.defaultAddress);
    if (this.defaultAddress == true) {
      console.log(" billing ==shipping");
      this.shared.billing.first_name = this.shared.shipping.first_name;
      this.shared.billing.last_name = this.shared.shipping.last_name;
      this.shared.billing.state = this.shared.shipping.state;
      this.shared.billing.postcode = this.shared.shipping.postcode;
      this.shared.billing.country = this.shared.shipping.country;
      this.shared.billing.address_1 = this.shared.shipping.address_1;
      this.shared.billing.address_2 = this.shared.shipping.address_2;
      this.shared.billing.city = this.shared.shipping.city;
      this.shared.billing.company = this.shared.shipping.company;
      this.shared.billingCountryName = this.shared.shippingCountryName;
      this.shared.billingStateName = this.shared.shippingStateName;
    }
    else {
      if (this.shared.customerData.id != null) {
        console.log("changing customer data billing");
        console.log(this.shared.customerData);
        this.shared.billing = this.shared.customerData.billing;
        this.shared.billingCountryName = this.location.getCountryName(this.shared.customerData.billing.country);
        this.shared.billingStateName = this.location.getStateName(this.shared.customerData.billing.country, this.shared.customerData.billing.state);
      }
      else {
        console.log("changing customer data to null for guest");
        this.shared.billing.first_name = '';
        this.shared.billing.last_name = '';
        this.shared.billing.state = '';
        this.shared.billing.postcode = '';
        this.shared.billing.country = '';
        this.shared.billing.address_1 = '';
        this.shared.billing.address_2 = '';
        this.shared.billing.city = '';
        this.shared.billing.company = '';
        this.shared.billingCountryName = "";
        this.shared.billingStateName = "";
      }
    }
    this.applicationRef.tick();
  }
  submit() {
    this.navCtrl.push(ShippingMethodPage);
    this.applicationRef.tick();
  }
  selectCountryPage() {
    let modal = this.modalCtrl.create(SelectCountryPage, { page: 'billing' });
    modal.present();
  }
  selectZonePage() {
    let modal = this.modalCtrl.create(SelectZonesPage, { page: 'billing', id: this.shared.billing.country });
    modal.present();
  }

}
