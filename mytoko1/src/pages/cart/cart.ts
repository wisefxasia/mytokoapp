// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ApplicationRef } from '@angular/core';
import { NavController, Events, ModalController, ActionSheetController } from 'ionic-angular';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { ProductDetailPage } from '../product-detail/product-detail';
import { LoadingProvider } from '../../providers/loading/loading';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { ShippingAddressPage } from '../shipping-address/shipping-address';
import { trigger, style, animate, transition } from '@angular/animations';
import { ProductsPage } from '../products/products';
import { TranslateService } from '@ngx-translate/core';
import { AlertProvider } from '../../providers/alert/alert';
import { CouponProvider } from '../../providers/coupon/coupon';
import { ThankYouPage } from '../thank-you/thank-you';

@Component({
  selector: 'page-cart',
  animations: [
    trigger(
      'animate', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('500ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('700ms', style({ opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'cart.html',
})
export class CartPage {
  total: any;
  subtotal: any;
  c = '';
  couponArray = [];
  products = [];
  loadingServerData = true;
  constructor(
    public navCtrl: NavController,
    public shared: SharedDataProvider,
    public config: ConfigProvider,
    public http: Http,
    public loading: LoadingProvider,
    public alert: AlertProvider,
    private storage: Storage,
    public translate: TranslateService,
    public events: Events,
    public modalCtrl: ModalController,
    private applicationRef: ApplicationRef,
    public couponProvider: CouponProvider,
    public actionSheetCtrl: ActionSheetController,
  ) {
    events.subscribe('openThankYouPage', () => {
      this.navCtrl.setRoot(ThankYouPage);
    });
    events.subscribe('openShippingAddressPage', () => {
      this.navCtrl.push(ShippingAddressPage);
    });
  }
  //============================================================================================  
  totalPrice() {
    var price = 0;
    var subPrice = 0;
    for (let value of this.products) {
      subPrice = subPrice + value.subtotal
      price = price + value.total;
    }
    this.subtotal = subPrice;
    this.total = price;
    // console.log(price);
  };
  //============================================================================================  
  getSingleProductDetail(id) {
    this.loading.show();
    this.config.Woocommerce.getAsync("products/" + id).then((data) => {
      this.loading.hide();
      this.navCtrl.push(ProductDetailPage, { data: JSON.parse(data.body) });
    }, err => {
      this.loading.hide();
      console.log(err);
    });
  }
  //============================================================================================  
  removeCart(id) {

    this.products.forEach((value, index) => {

      if (value.cart_id == id) {
        this.products.splice(index, 1);
        console.log("removing" + id);
      }
    });
    this.shared.removeCart(this.products);
    this.updateCart();
  }
  //============================================================================================  
  qunatityPlus = function (p) {
    if (p.stock_quantity == p.quantity)
      this.translate.get("Product Quantity is Limited!").subscribe((res) => { this.alert.show(res); });
    else if (p.stock_quantity == null || p.stock_quantity > p.quantity) {
      p.quantity++;
      p.subtotal = p.subtotal + parseFloat(p.price);
      p.total = p.total + parseFloat(p.price);
      this.updateCart();
    }

  }
  //============================================================================================  
  //function decreasing the quantity
  qunatityMinus = function (p) {
    if (p.quantity != 1) {
      p.quantity--;
      p.subtotal = parseFloat(p.price) * p.quantity;
      p.total = parseFloat(p.price) * p.quantity;
      this.updateCart();
    }

  }

  //============================================================================================  
  proceedToCheckOut() {
    if (this.shared.customerData.id == null || this.shared.customerData.id == undefined) {
      let modal = this.modalCtrl.create(LoginPage);
      modal.present();
    }
    else {
      // <!-- 2.0 updates -->
      if (this.config.checkOutPage == 1)
        this.shared.onePageCheckOut();
      else
        this.navCtrl.push(ShippingAddressPage);
    }
  }
  //============================================================================================  
  openProductsPage() {
    this.navCtrl.push(ProductsPage, { sortOrder: 'newest' });
  }
  //============================================================================================  
  ionViewWillEnter() {
    //if (this.config.admob == 1) this.shared.showAd();
    this.updateCart();
  }
  //============================================================================================  
  updateCart() {

    if (this.shared.cartProducts.length != 0) { this.loading.show(); this.loadingServerData = false; }
    let count = 0;
    this.shared.cartProducts.forEach((value, index) => {

      let id = value.product_id; if (value.variation_id != undefined) id = value.variation_id;
      this.config.Woocommerce.getAsync("products/" + id).then(data => {
        count++;
        let p = JSON.parse(data.body);
        if (p.id == undefined) { this.shared.cartProducts.splice(index, 1); }
        else if (p.status == 'trash') { this.shared.cartProducts.splice(index, 1); }
        else {
          value.price = p.price;
          value.name = p.name;
          value.stock_quantity = p.stock_quantity;
          value.tax_status = p.tax_status;
          value.image = p.images[0].src;
          value.tax_class = p.tax_class;
          value.tax_status = p.tax_status;
          value.on_sale = p.on_sale;
          value.categories = p.categories;

          if (p.stock_quantity == null) { }
          else if (p.stock_quantity < value.quantity) value.quantity = p.stock_quantity;
          else if (p.in_stock == false) { this.shared.cartProducts.splice(index, 1); }

          value.subtotal = parseFloat(value.price) * value.quantity;
          value.total = parseFloat(value.price) * value.quantity;
        }
        this.applicationRef.tick();
        if (count == this.shared.cartProducts.length) {
          this.changingCart();
          this.loading.hide();
          this.loadingServerData = true;
        }
      });
    });

  }
  //==========================================================================
  changingCart() {
    this.products = this.shared.cartProducts;
    this.storage.set('cartProducts', this.shared.cartProducts);
    this.shared.cartTotalItems();

    this.shared.couponArray.forEach((value) => {
      this.products = this.couponProvider.apply(value, this.shared.cartProducts);
    });

    this.totalPrice();
  }
  //============================================================================================   
  //getting getMostLikedProducts from the server
  getCoupon = function (code) {
    this.loading.show();

    this.config.Woocommerce.getAsync("coupons?code=" + code).then((data) => {

      this.loading.hide();
      let d = JSON.parse(data.body);
      let coupon = d[0];
      if (d.length == 0) this.translate.get("Invalid Coupon Code!").subscribe((res) => { this.alert.show(res); });
      else
        this.applyCouponCart(coupon);


    }, error => {
      this.loading.hide();
      console.log(error);
    });
  };
  //============================================================================================  
  //applying coupon on the cart
  applyCouponCart = function (coupon) {
    //checking the coupon is valid or not

    if (this.couponProvider.validateCouponService(coupon, this.products, this.shared.couponArray) == false) {
      return 0;
    } else {
      if (coupon.individual_use == 1) {
        this.products = (JSON.parse(JSON.stringify(this.shared.cartProducts)));
        this.shared.couponArray = [];
        console.log('individual_use');
      }
      var v: { [k: string]: any } = {};
      v.code = coupon.code;
      v.amount = coupon.amount;
      v.product_ids = coupon.product_ids;
      v.excluded_product_ids = coupon.exclude_product_ids;
      v.product_categories = coupon.product_categories;
      v.excluded_product_categories = coupon.excluded_product_categories;
      v.discount = coupon.amount;
      v.individual_use = coupon.individual_use;
      v.free_shipping = coupon.free_shipping;
      v.discount_type = coupon.discount_type;
      // v.limit_usage_to_x_items = coupon.limit_usage_to_x_items;
      // v.usage_limit = coupon.usage_limit;
      // v.used_by = coupon.used_by ;
      // v.usage_limit_per_user = coupon.usage_limit_per_user ;
      // v.exclude_sale_items = coupon.exclude_sale_items;
      this.shared.couponArray.push(coupon);
    }

    //applying coupon service
    this.products = this.couponProvider.apply(coupon, this.products);
    this.updateCart();
  };
  //============================================================================================  
  //delete Coupon
  deleteCoupon = function (code) {
    this.shared.couponArray.forEach((value, index) => {
      if (value.code == code) { this.shared.couponArray.splice(index, 1); return true; }
    });
    this.updateCart();
    console.log(this.shared.couponArray);
  };

  couponslist() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Demo Coupons',
      buttons: [
        {
          icon: 'arrow-round-forward',
          text: 'Product Fixed (fp). A fixed total discount for selected products only',
          handler: () => {
            this.c = 'fp';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Cart Fixed (fc). A fixed total discount for the entire cart',
          handler: () => {
            this.c = 'fc';
          }
        },
        {
          icon: 'arrow-round-forward',
          text: 'Product Percentage (percentage). A percentage discount for selected products only',
          handler: () => {
            this.c = 'percentage';
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
  }

}
