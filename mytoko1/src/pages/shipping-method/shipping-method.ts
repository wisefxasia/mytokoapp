// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import { LoadingProvider } from '../../providers/loading/loading';
import { LocationDataProvider } from '../../providers/location-data/location-data';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { ThankYouPage } from '../thank-you/thank-you';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { OrderPage } from '../order/order';


@Component({
  selector: 'page-shipping-method',
  templateUrl: 'shipping-method.html',
})
export class ShippingMethodPage {
  shippingMethod = new Array;
  selectedMethod = true;
  shippingLocations = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public shared: SharedDataProvider,
    public http: Http,
    public storage: Storage,
    public spinnerDialog: SpinnerDialog,
    public config: ConfigProvider,
    public translate: TranslateService,
    public loading: LoadingProvider,
    public location: LocationDataProvider,
    public themeableBrowser: ThemeableBrowser,
  ) {
    this.translate.get(this.shared.checkOutPageText).subscribe((res) => { this.shared.checkOutPageText = res; });
    if (this.shared.customerData.id != null) this.updateUser(); // <!-- 2.0 updates -->
    this.getShippingZones();
  }
  //=================================================================================================================================
  getShippingZones() {
    this.loading.show();
    this.config.Woocommerce.getAsync("shipping/zones").then((data) => {
      let d = JSON.parse(data.body);
      this.getShippingLocations(d);
    });
  }
  //=================================================================================================================================
  getShippingLocations(array) {
    var count = 0;
    for (let v of array) {
      this.config.Woocommerce.getAsync("shipping/zones/" + v.id + "/locations").then((data) => {
        count++;
        let d = JSON.parse(data.body);
        for (let v2 of d) {
          this.shippingLocations.push(Object.assign(v2, { zoneId: v.id }));
        }
        if (array.length == count) { this.loading.hide(); this.sortArray(this.shippingLocations); }
      });
    }
  }
  //=================================================================================================================================
  sortArray(array) {
    let tempArray = [];
    for (let value of array) {
      if (value.type == "postcode") { tempArray.push(value); }
    }
    for (let value of array) {
      if (value.type == "state") { tempArray.push(value); }
    }
    for (let value of array) {
      if (value.type == "country") { tempArray.push(value); }
    }
    for (let value of array) {
      if (value.type == "continent") { tempArray.push(value); }
    }
    console.log(tempArray);
    this.findZoneId(tempArray);
  }
  //=================================================================================================================================
  findZoneId(array) {
    let zoneId = ""
    for (let value of array) {
      if (value.type == "postcode") {
        if (this.matchPostCode(value)) {
          zoneId = value.zoneId;
          console.log("postcode" + "  " + value.code);
          break;
        }
      }
      else if (value.type == "state") {
        if (this.matchState(value)) {
          console.log("state" + "  " + value.code);
          zoneId = value.zoneId;
          break;
        }
      }
      else if (value.type == "country") {
        if (this.matchCountry(value)) {
          console.log("country" + "  " + value.code)
          zoneId = value.zoneId;
          break;
        }
      }
      else if (value.type == "continent") {
        if (this.matchContinent(value)) {
          console.log("continent" + "  " + value.code);
          zoneId = value.zoneId;
          break;
        }
      }
    }

    this.getShippingMethods(zoneId);
  }
  //=================================================================================================================================
  matchPostCode(value) {

    let postcode = this.shared.shipping.postcode;
    if (value.code.toUpperCase() == postcode.toUpperCase()) return true;
    if (value.code.indexOf("*") > 0) {

      let ind = value.code.indexOf("*");
      let s1 = postcode.substring(0, ind - 1);
      let s2 = value.code.substring(0, ind - 1);

      if (s1.toUpperCase() == s2.toUpperCase()) {
        return true;
      }
    }
    if (value.code.indexOf(".") > 0) {

      let i = value.code.indexOf(".");
      let min = value.code.substring(0, i);
      let max = value.code.substring(i + 3, value.code.length);

      min = parseInt(min);
      let p = parseInt(postcode);
      max = parseInt(max);

      if (p >= min && p <= max) {
        return true;
      }
    }

  }
  //=================================================================================================================================
  matchState(value) {
    let s = this.shared.shipping.country + ":" + this.shared.shipping.state;
    if (s == value.code) {
      return true;
    }
  }
  //=================================================================================================================================
  matchCountry(value) {
    let s = this.shared.shipping.country;
    if (s == value.code) {
      return true;
    }
  }
  //=================================================================================================================================
  matchContinent(value) {
    let s = this.location.getContientCode(this.shared.shipping.country);
    if (s == value.code) return true;
  }
  //=================================================================================================================================
  getShippingMethods(id) {
    if (id == "") id = 0;
    this.loading.show();
    this.config.Woocommerce.getAsync("shipping/zones/" + id + "/methods").then((data) => {
      this.loading.hide();
      this.shippingMethod = JSON.parse(data.body);
    });

  }
  //=================================================================================================================================
  setMethod(data) {
    this.shared.shipping_lines = [];
    var s: { [k: string]: any } = {};
    if (data.method_id == "flat_rate")
      s = {
        method_id: data.method_id,
        method_title: data.title,
        total: this.calculateFlatRate(data)
      }
    else if (data.settings.cost) {
      let cal = (data.settings.cost.value).toString();
      if (cal == "") cal = "0";
      s = {
        method_id: data.method_id,
        method_title: data.title,
        total: cal
      }
    }
    else {
      s = {
        method_id: data.method_id,
        method_title: data.title,
        total: "0"
      }
    }
    console.log(s);
    this.shared.shipping_lines.push(s);
  }
  //===============================================================================
  calculateFlatRate(data) {
    // if (data.settings.cost.value.indexOf("*") > 0) {
    //   let split = data.settings.cost.value.split("*");
    //   let value = parseFloat(split[0]);
    //   let result = value * this.shared.cartTotalItems();
    //   return result.toString();
    // }
    // else 
    let cal = (data.settings.cost.value).toString();
    if (cal == "") cal = "0";
    return cal;

  }
  //=====================================================================================================================
  checkFreeShipping(data) {
    if (data.method_id != "free_shipping") { return true; }

    if (data.settings.requires.value == "") { return true; }

    if (data.settings.requires.value == "coupon") {
      if (this.findFreeShippingCoupon()) return true;
      else return false;

    }
    if (data.settings.requires.value == "both") {
      //console.log("total : " + this.shared.productsTotal() + " coupon min " + data.settings.min_amount.value);
      if (this.shared.productsTotal() >= data.settings.min_amount.value && this.findFreeShippingCoupon()) {
        return true;
      } else return false;
    }
    if (data.settings.requires.value == "either") {
      if (this.shared.productsTotal() >= data.settings.min_amount.value || this.findFreeShippingCoupon()) {
        return true;
      } else return false;
    }
    if (data.settings.requires.value == "min_amount") {
      if (this.shared.productsTotal() >= data.settings.min_amount.value) {
        return true;
      } else return false;
    }

  }
  //=====================================================================================================================
  findFreeShippingCoupon() {
    let found = false;
    if (this.shared.couponArray.length == 0) return false;
    for (let value of this.shared.couponArray) {
      if (value.free_shipping == true) found = true;
    }
    if (found == true) return true;
    else return false;
  }
  proceedOrder() {
    if (this.config.checkOutPage == 2) this.navCtrl.push(OrderPage);
    else this.openOrderPage();
  }
  //=====================================================================================================================
  openOrderPage() {
    let options: ThemeableBrowserOptions = {

      statusbar: {
        color: '#51688F'
      },
      toolbar: {
        height: 44,
        color: '#51688F'
      },
      title: {
        color: '#ffffff',
        staticText: this.shared.checkOutPageText,
        showPageTitle: false
      },
      closeButton: {
        wwwImage: 'assets/close.png',
        align: 'right',
        event: 'closePressed'
      },
      backButton: {
        wwwImage: 'assets/back.png',
        align: 'left'
       // event: 'closePressed'
      },
      backButtonCanClose: true,
      //hidden: 'yes',
      // clearcache:'yes',
      // clearsessioncache:'yes'
    }

    let customer_id = 0;// <!-- 2.0 updates -->
    if (this.shared.customerData.id != null) customer_id = this.shared.customerData.id;// <!-- 2.0 updates -->
    let token = null;// <!-- 2.0 updates -->
    if (this.shared.customerData.cookie != null) token = this.shared.customerData.cookie;// <!-- 2.0 updates -->
    let onePage = this.config.checkOutPage;
    
    var data = {
      token: token,// <!-- 2.0 updates -->
      // payment_method: this.selectedPaymentMethod,
      // payment_method_title: this.selectedPaymentMethodTitle,
      billing_info: this.shared.billing,
      shipping_info: this.shared.shipping,
      products: this.getProducts(),
      shipping_ids: this.shared.shipping_lines,
      coupons: this.getCoupons(),
      customer_note: "",
      customer_id: customer_id,// <!-- 2.0 updates -->
      sameAddress: this.shared.sameAddress,
      one_page: onePage,
      platform: this.shared.device,
    };
    console.log(data);
    var uri = encodeURIComponent(JSON.stringify(data));

    const b: ThemeableBrowserObject = this.themeableBrowser.create(this.config.url + "/mobile-checkout/?order=" + uri, '_blank', options);
    let orderPlaced = false;
    b.on('loadstart').subscribe(res => {
      this.translate.get('Loading').subscribe((res) => {
        this.spinnerDialog.show("", res, true, { overlayOpacity: 1.00 });
        setTimeout(() => {
          this.spinnerDialog.hide();
        }, 5000);
      });

      if (res.url.indexOf('order-received') != -1 && res.url.indexOf(this.config.url) == 0) {
        console.log(res.url);
        orderPlaced = true;
        b.close();
        this.navCtrl.setRoot(ThankYouPage);
      } else if (res.url.indexOf('cancel_order=true') != -1) {
        b.close();
      }

    });

    b.on('closePressed').subscribe(res => {
      b.close();
    });
    b.on('loadstop').subscribe(res => {
      console.log('loadstop');
    });

    b.on('exit').subscribe(res => {
      if (orderPlaced) this.navCtrl.setRoot(ThankYouPage);
    });
  }
  //=================================================================================================================================
  getProducts() {
    var data = [];
    for (let v of this.shared.cartProducts) {
      var obj = { quantity: v.quantity, product_id: v.product_id, total: v.total.toString() };
      if (v.variation_id) Object.assign(obj, { variation_id: v.variation_id })
      //if (v.meta_data) Object.assign(obj, { meta_data: v.meta_data })
      data.push(obj);
    }
    return data;
  }
  //=================================================================================================================================
  //Object.assign(c, JSON.parse(data.body)
  getCoupons() {
    var data = [];
    for (let v of this.shared.couponArray) {
      data.push({ code: v.code, discount: v.amount });
    }
    return data;
  }
  //=================================================================================================================================
  getShippingLines() {
    var data = [];
    for (let v of this.shared.shipping_lines) {
      data.push({ code: v.code, discount: v.amount });
    }
    return data;
  }
  //=================================================================================================================================
  updateUser() {
    var data = {
      billing: this.shared.billing,
      shipping: this.shared.shipping
    };
    this.config.Woocommerce.putAsync("customers/" + this.shared.customerData.id, data).then((data) => {
      let dat = JSON.parse(data.body);
      this.shared.customerData.billing = dat.billing;
      this.shared.customerData.shipping = dat.shipping;
      this.storage.set('customerData', this.shared.customerData);
    });
  }
  //=================================================================================================================================
  ionViewWillEnter() {
    this.shared.shipping_lines = [];
  }
}
