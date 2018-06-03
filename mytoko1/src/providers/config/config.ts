

import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { LocalNotifications } from "@ionic-native/local-notifications";
import { Storage } from '@ionic/storage';
import { Platform } from "ionic-angular";
import * as WC from 'woocommerce-api';





@Injectable()

export class ConfigProvider {


  public url: string = 'https://mytoko.cepatbuat.website';
  public consumerKey: string = 'ck_9b5747a232448190f75e57822501b85d61fb10f8';
  public consumerSecret: string = 'cs_1d4b16415eaa3a99ce78a3d0e73ca515b5e44e90';


  Woocommerce = WC({
    url: this.url,
    consumerKey: this.consumerKey,
    consumerSecret: this.consumerSecret,
    wpAPI: true,
    queryStringAuth: true,
    version: 'wc/v2'
  });

  public urlExt: string = this.url + "/wp-json/woo_app_connect/mobile/";
  public langId: string = localStorage.langId;
  public loader = 'dots';
  public newProductDuration = 100;
  public cartButton = 1;//1 = show and 0 = hide
  public currency = "$";
  public currencyPos = "left";
  public paypalCurrencySymbol = 'USD';
  public address;
  public fbId;
  public email;
  public latitude;
  public longitude;
  public phoneNo;
  public pushNotificationSenderId;
  public lazyLoadingGif;
  public notifText;
  public notifTitle;
  public notifDuration;
  public footerShowHide;
  public homePage = 1;
  public categoryPage = 1;
  public siteUrl = '';
  public appName = '';
  public packgeName = 1;
  public introPage = 1;
  public myOrdersPage = 1;
  public newsPage = 1;
  public wishListPage = 1;
  public shippingAddressPage = 1;
  public aboutUsPage = 1;
  public contactUsPage = 1;
  public editProfilePage = 1;
  public settingPage = 1;
  public admob = 1;
  public admobBannerid = '';
  public admobIntid = '';
  public googleAnalaytics = "";
  public rateApp = 1;
  public shareApp = 1;
  public fbButton = 1;
  public googleButton = 1;
  public admobIos = 1;
  public admobBanneridIos = '';
  public admobIntidIos = '';
  public notificationType = "";
  public onesignalAppId = "";
  public onesignalSenderId = "";
  public privacyPolicy = "";
  public termServices = "";
  public aboutUs = "";
  public refundPolicy = "";
  public filterMaxPrice = 1000;
  public guestCheckOut = true; // <!-- 2.0 updates -->
  public checkOutPage = 1; // <!-- 2.0 updates -->

  constructor(
    public http: Http,
    private storage: Storage,
    public platform: Platform,
    private localNotifications: LocalNotifications,
  ) {
  }
  public siteSetting() {
    return new Promise(resolve => {
      this.http.get(this.url + '/api/appsettings/get_all_settings/?insecure=cool').map(res => res.json()).subscribe(data => {
        var settings = data;
        this.fbId = settings.facebook_app_id;
        this.address = settings.address + ', ' + settings.city + ', ' + settings.state + ' ' + settings.zip + ', ' + settings.country;
        this.email = settings.contact_us_email;
        this.latitude = settings.latitude;
        this.longitude = settings.longitude;
        this.phoneNo = settings.phone_no;
        this.pushNotificationSenderId = settings.fcm_android_sender_id;
        this.lazyLoadingGif = settings.lazzy_loading_effect;
        this.newProductDuration = settings.new_product_duration;
        this.notifText = settings.notification_text;
        this.notifTitle = settings.notification_title;
        this.notifDuration = settings.notification_duration;
        this.currency = settings.currency_symbol;
        this.cartButton = parseInt(settings.cart_button);
        console.log(this.cartButton);
        this.footerShowHide = parseInt(settings.footer_button);
        this.setLocalNotification();
        this.appName = settings.app_name;
        this.homePage = parseInt(settings.home_style);
        this.categoryPage = parseInt(settings.category_style);
        this.siteUrl = settings.site_url;
        this.introPage = parseInt(settings.intro_page);
        this.myOrdersPage = parseInt(settings.my_orders_page);
        this.newsPage = parseInt(settings.news_page);
        this.wishListPage = parseInt(settings.wish_list_page);
        this.shippingAddressPage = parseInt(settings.shipping_address_page);
        this.aboutUsPage = parseInt(settings.about_us_page);
        this.contactUsPage = settings.contact_us_page;
        this.editProfilePage = parseInt(settings.edit_profile_page);
        this.packgeName = settings.package_name;
        this.settingPage = parseInt(settings.setting_page);
        this.admob = parseInt(settings.admob);
        this.admobBannerid = settings.ad_unit_id_banner;
        this.admobIntid = settings.ad_unit_id_interstitial;
        this.googleAnalaytics = settings.google_analytic_id;
        this.rateApp = parseInt(settings.rate_app);
        this.shareApp = parseInt(settings.share_app);
        this.fbButton = parseInt(settings.facebook_login);

        this.onesignalAppId = settings.os_android;
        this.onesignalSenderId = settings.os_android_sender_id;
        this.admobIos = parseInt(settings.ios_admob);
        this.admobBanneridIos = settings.ios_ad_unit_id_banner;
        this.admobIntidIos = settings.ios_ad_unit_id_interstitial;
        this.privacyPolicy = settings.privacy_page;
        this.termServices = settings.terms_page;
        this.aboutUs = settings.about_page;
        this.refundPolicy = settings.refund_page;
        this.filterMaxPrice = parseInt(settings.filter_max_price);

        if (settings.checkout_process == "yes") this.guestCheckOut = true;// <!-- 2.0 updates -->
        else this.guestCheckOut = false;// <!-- 2.0 updates -->
        // if (settings.one_page_checkout == "1") this.onePageCheckOut = true;// <!-- 2.0 updates -->
        // else 
        this.checkOutPage = parseInt(settings.one_page_checkout);
        //this.checkOutPage = 2;
        resolve();
      });
    });
  }
  //Subscribe for local notification when application is start for the first time
  setLocalNotification() {
    console.log('localNotification called');
    this.platform.ready().then(() => {
      this.storage.get('localNotification').then((val) => {
        if (val == undefined) {
          console.log('localNotification configured');
          this.storage.set('localNotification', 'localNotification');
          this.localNotifications.schedule({
            id: 1,
            title: this.notifTitle,
            text: this.notifText,
            every: this.notifDuration,
          });
        }
      });
    });
  }


}
