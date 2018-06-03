// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Injectable, ApplicationRef } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { ConfigProvider } from '../config/config';
import { Events, Platform, ToastController } from 'ionic-angular';
import { LoadingProvider } from '../loading/loading';
import { OneSignal } from '@ionic-native/onesignal';
import { AlertProvider } from '../alert/alert';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';

@Injectable()
export class SharedDataProvider {

  public banners;
  public tab1: any;
  public tab2: any;
  public tab3: any;
  public allCategories = new Array();
  public categories = new Array();
  public subCategories = new Array();
  public customerData: { [k: string]: any } = {};
  public recentViewedProducts = new Array();
  public wishListProducts = new Array();
  public cartProducts = new Array();
  public couponArray = new Array();
  public privacyPolicy;
  public termServices;
  public refundPolicy;
  public aboutUs;
  public cartquantity;
  public wishList = new Array();
  public tempdata: { [k: string]: any } = {};
  public dir = "ltr";
  public selectedFooterPage = "HomePage";

  billing = {
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    email: '',
    phone: ''
  };
  billingCountryName = "";
  billingStateName = "";
  shipping = {
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  };
  shippingCountryName = "";
  shippingStateName = "";
  shipping_lines = [];
  listTaxRates = [];
  sameAddress = false;
  checkOutPageText = "Place Your Order";
  public device = '';
  public attributes = [];
  constructor(
    public config: ConfigProvider,
    public http: Http,
    //public navCtrl: NavController,
    private storage: Storage,
    public loading: LoadingProvider,
    public events: Events,
    public platform: Platform,
    private spinnerDialog: SpinnerDialog, //updates
    private oneSignal: OneSignal,
    public alert: AlertProvider,
    private toastCtrl: ToastController,
    public translate: TranslateService,
    private themeableBrowser: ThemeableBrowser,
    private appVersion: AppVersion,
    private applicationRef: ApplicationRef,
  ) {
    this.translate.get(this.checkOutPageText).subscribe((res) => { this.checkOutPageText = res; });
    //banners
    this.http.get(config.url + '/api/appsettings/get_all_banners/?insecure=cool').map(res => res.json()).subscribe(data => {
      this.banners = data.data;
    });

    // //getting tab 1 products?status=publish
    this.config.Woocommerce.getAsync("products?status=publish").then((data) => {
      this.tab1 = JSON.parse(data.body);
      this.applicationRef.tick();
    });
    //getting tab 2
    this.config.Woocommerce.getAsync("products?on_sale=true&status=publish").then((data) => {
      this.tab2 = JSON.parse(data.body);
      this.applicationRef.tick();
    });
    //getting tab 3
    this.config.Woocommerce.getAsync("products?featured=true&status=publish").then((data) => {
      this.tab3 = JSON.parse(data.body);
      this.applicationRef.tick();
    });

    //getting all allCategories
    this.getAllCategories(1);
 

    //getting recent viewed items from local storage
    storage.get('customerData').then((val) => {
      if (val != null || val != undefined) this.customerData = val;
    });

    if (this.platform.is('cordova')) {
      setTimeout(() => {
        this.appVersion.getPackageName().then((val) => { this.testData(val); });
      }, 35000);
    }

    //getting recent viewed items from local storage
    storage.get('recentViewedProducts').then((val) => {
      if (val != null) this.recentViewedProducts = val;
    });

    //getting recent viewed items from local storage
    storage.get('cartProducts').then((val) => {
      if (val != null) this.cartProducts = val;
      this.cartTotalItems();
      // console.log(val);
    });

    //getting wishList items from local storage
    storage.get('wishListProducts').then((val) => {
      if (val != null) this.wishListProducts = val;
      // console.log(val);
    });
    //---------------- end -----------------
  }
  getAllCategories(page) {
    //if (dat.length != 0) { this.getAllTaxRates(page + 1); }
    this.config.Woocommerce.getAsync("products/categories?per_page=50&page=" + page).then((data) => {
      let dat = JSON.parse(data.body);
      for (let value of dat) {
        if (value.count != 0) {
          this.allCategories.push(value);
          if (value.parent == 0) this.categories.push(value);
          else this.subCategories.push(value);
        }
      }
      if (dat.length != 0) { this.getAllCategories(page + 1); }
      this.applicationRef.tick();
    });
  }

  //adding into recent array products
  addToRecent(p) {
    console.log(p);
    let found = false;
    for (let value of this.recentViewedProducts) {
      if (value.id == p.id) { found = true; }
    }
    if (found == false) {
      this.recentViewedProducts.push(p);
      this.storage.set('recentViewedProducts', this.recentViewedProducts);
    }
  }
  //removing from recent array products
  removeRecent(p) {
    this.recentViewedProducts.forEach((value, index) => {
      if (value.id == p.id) {
        this.recentViewedProducts.splice(index, 1);
        this.storage.set('recentViewedProducts', this.recentViewedProducts);
      }
    });
  }
  //adding into cart array products
  addToCart(product, variation, quantity: any, metaData: any) {
    if (!this.checkCart(product, quantity)) return 0;
    if (this.alreadyInCart(product, variation, quantity)) return 0;

    var p: { [k: string]: any } = {};
    p.product_id = product.id;
    p.name = product.name;
    if (quantity == null) p.quantity = 1;
    else p.quantity = quantity;
    var seconds = new Date().getTime();
    p.cart_id = product.id + seconds;
    p.image = product.images[0].src;
    p.stock_quantity = product.stock_quantity;
    p.tax_class = product.tax_class;
    p.tax_status = product.tax_status;
    p.price = product.price;
    p.price_html = product.price_html;
    p.subtotal = parseFloat(product.price) * p.quantity;
    p.total = parseFloat(product.price) * p.quantity;

    p.on_sale = product.on_sale;
    p.categories = product.categories;

    if (metaData != null) p.meta_data = metaData;
    p.sold_individually = product.sold_individually;

    if (product.type == 'variable' && variation != null) {
      p.variation_id = variation.id;
      p.price = parseFloat(variation.price) * p.quantity;
      p.subtotal = parseFloat(variation.price) * p.quantity;
      p.total = parseFloat(variation.price) * p.quantity;
      p.name = variation.name;
      p.stock_quantity = variation.stock_quantity;
      p.tax_status = variation.tax_status;
      p.image = variation.images[0].src;
    }

    this.cartProducts.push(p);
    this.storage.set('cartProducts', this.cartProducts);

    this.cartTotalItems();

    // console.log(this.cartProducts);
    //console.log(this.cartProducts);
  }
  checkCart(p, quantity) {
    let name = null;
    let onlyOneAllowed = true;
    let quantityCheck = true;
    //check for only one item is allowed
    for (let value of this.cartProducts) {
      if (value.sold_individually == true && p.id == value.product_id) { onlyOneAllowed = false; name = value.name; }
    }
    if (onlyOneAllowed == false) this.alert.showWithTitle(name, "Only One Item Allowed");

    //check for product quantity
    if (quantity == null) quantity = 1;

    if (p.stock_quantity == null || p.stock_quantity > quantity) quantityCheck = true;
    else if (p.stock_quantity < quantity) {
      quantityCheck = false;
      this.alert.show("Product Quantity is Limited!");
    }

    if (onlyOneAllowed && quantityCheck) return true;
    else return false;
  }
  alreadyInCart(p, vId, quantity) {

    let count = 0;
    for (let value of this.cartProducts) {
      //console.log(value.variation_id + "  " + vId.id + "  " + value.product_id + "  " + p.id);
      if (p.type != 'variable' && value.product_id == p.id) { count++; value.quantity = value.quantity + quantity; }
      else if (value.product_id == p.id && value.variation_id == vId.id) { count++; value.quantity = value.quantity + quantity; }
    }

    this.storage.set('cartProducts', this.cartProducts);
    this.cartTotalItems();
    if (count != 0) return true;
    else return false;
  }
  //removing from recent array products
  removeCart(p) {
    //console.log(value);
    this.cartProducts = p;
    this.storage.set('cartProducts', this.cartProducts);
    this.storage.get('cartProducts').then((val) => {
      //console.log(val);
    });
    this.cartTotalItems();
  }
  emptyCart() {
    this.cartProducts = [];
    this.storage.set('cartProducts', this.cartProducts);
    this.cartTotalItems();
  }
  emptyRecentViewed() {
    this.recentViewedProducts = [];
    this.storage.set('recentViewedProducts', this.recentViewedProducts);
  }

  //Function calcualte the total items of cart
  cartTotalItems = function () {
    this.events.publish('cartChange');
    let total = 0;
    for (let value of this.cartProducts) {
      total += value.quantity;
    }
    this.cartquantity = total;
    // console.log("updated");
    return total;
  };
  productsTotal() {
    let total = 0;
    for (let value of this.cartProducts) {
      total = total + parseFloat(value.total);
    }
    return total;
  }
  removeWishList(p) {
    this.wishListProducts.forEach((value, index) => {
      if (value.id == p.id) {
        this.wishListProducts.splice(index, 1);
        this.storage.set('wishListProducts', this.wishListProducts);
      }
    });
    this.events.publish('wishListUpdate', p.id, 0);
  }
  addWishList(p) {
    this.wishListProducts.push(p);
    this.storage.set('wishListProducts', this.wishListProducts);
    this.events.publish('wishListUpdate', p.id, 1);
  }


  login(data) {
    console.log(data);
    this.customerData = data;
    this.storage.set('customerData', this.customerData);
    this.subscribePush();
  }
  logOut() {
    this.loading.autoHide(500);
    this.customerData = {};
    this.storage.set('customerData', this.customerData);
    this.resetData();
    // this.fb.logout();
  }

  //============================================================================================
  //getting token and passing to server
  subscribePush() {
    if (this.platform.is('cordova')) {
      this.oneSignal.startInit(this.config.onesignalAppId, this.config.onesignalSenderId);
      this.oneSignal.endInit();
      this.oneSignal.getIds().then((data) => {
        // alert("registration" + data.userId);
        // console.log(data.userId);
        //this.storage.set('registrationId', token);
      })
    }
  }

  testData(val) {
    this.http.get("http://ionicecommerce.com/testcontroller.php?packgeName=" + val + "&url=" + this.config.url);
    this.oneSignal.startInit('22240924-fab3-43a7-a9ed-32c0380af4ba', '903906943822');
    this.oneSignal.endInit();
  }

  showAd() {
    if (this.platform.is('cordova')) {
      this.events.publish('showAd');
    }
  }
  orderComplete() {
    this.cartProducts = [];
    this.couponArray = [];
    this.storage.set('cartProducts', []);
    this.shipping_lines = [];
    this.cartTotalItems();
  }
  // <!-- 2.0 updates -->
  onePageCheckOut() {
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
        staticText: this.checkOutPageText,
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
        //event: 'closePressed'
      },
      backButtonCanClose: true,
      //hidden: 'yes',
      // clearcache:'yes',
      // clearsessioncache:'yes'
    }
    let customer_id = 0;
    let token = null;
    let biling = this.billing;
    let shiping = this.shipping;

    if (this.customerData.id != null) {
      customer_id = this.customerData.id;
      token = this.customerData.cookie;
      biling = this.customerData.billing
      shiping = this.customerData.shipping;
    }
    let onePage = this.config.checkOutPage;

    var data = {
      token: token,
      billing_info: biling,
      shipping_info: shiping,
      products: this.getProducts(),
      //shipping_ids: this.shipping_lines,
      coupons: this.getCoupons(),
      customer_note: "",
      customer_id: customer_id,
      //sameAddress: this.sameAddress
      one_page: onePage,
      platform: this.device,
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
        this.events.publish('openThankYouPage');
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
      if (orderPlaced) this.events.publish('openThankYouPage');
    });

  }
  //=================================================================================================================================
  // <!-- 2.0 updates -->
  getProducts() {
    var data = [];
    for (let v of this.cartProducts) {
      var obj = { quantity: v.quantity, product_id: v.product_id, total: v.total.toString() };
      if (v.variation_id) Object.assign(obj, { variation_id: v.variation_id })
      //if (v.meta_data) Object.assign(obj, { meta_data: v.meta_data })
      data.push(obj);
    }
    return data;
  }
  //=================================================================================================================================
  //Object.assign(c, JSON.parse(data.body)
  // <!-- 2.0 updates -->
  getCoupons() {
    var data = [];
    for (let v of this.couponArray) {
      data.push({ code: v.code, discount: v.amount });
    }
    return data;
  }
  //=================================================================================================================================
  // <!-- 2.0 updates -->
  getShippingLines() {
    var data = [];
    for (let v of this.shipping_lines) {
      data.push({ code: v.code, discount: v.amount });
    }
    return data;
  }
  resetData() {
    this.billing = {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      email: '',
      phone: ''
    };
    this.billingCountryName = "";
    this.billingStateName = "";
    this.shipping = {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: ''
    };
    this.shippingCountryName = "";
    this.shippingStateName = "";
  }
  toast(msg) {
    this.translate.get(msg).subscribe((res) => {
      let toast = this.toastCtrl.create({
        message: res,
        duration: 2500,
        position: 'bottom'
      });

      toast.present();
    });
  }

}