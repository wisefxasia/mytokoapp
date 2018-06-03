// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, Searchbar } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import { LoadingProvider } from '../../providers/loading/loading';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { LocationDataProvider } from '../../providers/location-data/location-data';



@Component({
  selector: 'page-select-country',
  templateUrl: 'select-country.html',
})
export class SelectCountryPage {
  @ViewChild('Searchbar') searchBar: Searchbar;
  searchQuery: string = '';
  items;
  countries = new Array;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public config: ConfigProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public loading: LoadingProvider,
    public shared: SharedDataProvider,
    public location: LocationDataProvider) {


    this.items = this.countries = this.location.data.countries;
    setTimeout(() => { this.searchBar.setFocus(); }, 250);

  }

  initializeItems() {
    this.items = this.countries
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  //close modal
  dismiss() {
    this.viewCtrl.dismiss();
  }
  selectCountry(c) {
    if (this.navParams.get('page') == 'shipping') {
      this.shared.shippingCountryName = c.name;
      this.shared.shipping.country = c.value;
      this.shared.shipping.state = null;
      this.shared.shipping.city = null;
      this.shared.shipping.postcode = null;
      this.shared.shippingStateName = "";
    }
    else {
      this.shared.billingCountryName = c.name;
      this.shared.billing.country = c.value;
      this.shared.billing.state = null;
      this.shared.billing.city = null;
      this.shared.billing.postcode = null;
      this.shared.billingStateName = "";
    }
    this.dismiss();
  }
  
}
