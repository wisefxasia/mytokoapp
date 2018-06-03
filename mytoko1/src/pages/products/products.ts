// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ViewChild, ApplicationRef } from '@angular/core';
import { NavController, NavParams, InfiniteScroll, Content, ActionSheetController, Slides } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { Http } from '@angular/http';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { LoadingProvider } from '../../providers/loading/loading';
import { TranslateService } from '@ngx-translate/core';
import { CartPage } from '../cart/cart';


@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage {
  attributes = [];
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;
  scrollTopButton = false;

  @ViewChild(InfiniteScroll) infinite: InfiniteScroll;
  //@ViewChild(IonRange) priceRange: IonRange;
  products = new Array;
  selectedTab = '';
  categoryId = '';
  categoryName = '';
  sortOrder = 'Newest';
  sortArray = ['Newest', 'A - Z', 'Z - A'];
  //, 'A - Z Date', 'Z - A Date'
  //'Latest', 'On Sale', 'Featured'
  page = 1;
  applyFilter = false;
  filters = [];
  selectedFilters = [];
  maxAmount = this.config.filterMaxPrice;
  price = { lower: 0, upper: this.maxAmount };
  side = "right";
  productView = 'grid';
  on_sale = false;
  featured = false;
  filterOnSale = false;
  filterFeatured = false;
  loadingServerData = true;
  type = "";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public config: ConfigProvider,
    public shared: SharedDataProvider,
    public loading: LoadingProvider,
    public translate: TranslateService,
    public http: Http,
    public actionSheet: ActionSheetController,
    private applicationRef: ApplicationRef) {

    if (shared.dir == "rtl") this.side = "left";

    if (this.navParams.get('id') != undefined) this.selectedTab = this.categoryId = this.navParams.get('id');
    if (this.navParams.get('name') != undefined) this.categoryName = this.navParams.get('name');
    if (this.navParams.get('type') != undefined) this.type = this.navParams.get('type');

    console.log(this.type);
    this.applicationRef.tick();

    this.getProducts(null);
    //this.getAllAttributes();

  }
  //=======================================================================================
  getProducts(infiniteScroll) {

    if (this.page == 1) { this.loading.show(); this.loadingServerData = false; }
    var data: { [k: string]: any } = {};
    if (this.shared.customerData != null)//in case user is logged in customer id will be send to the server to get user liked products
      data.customers_id = this.shared.customerData.customers_id;


    let query = 'products?page=' + this.page;

    if (this.sortOrder == "Newest") query = query + "&order=desc&orderby=date";
    else if (this.sortOrder == "A - Z") query = query + "&order=asc&orderby=title";
    else if (this.sortOrder == "Z - A") query = query + "&order=desc&orderby=title";
    // else if (this.sortOrder == "Z - A Date") query = query + "&order=desc&orderby=date";
    // else if (this.sortOrder == "A - Z Date") query = query + "&order=asc&orderby=date";

    if (this.type == "featured" || this.filterFeatured) { query = query + "&featured=true"; this.filterFeatured = true; this.applyFilter = true; }

    if (this.type == "sale" || this.type == "on_sale" || this.filterOnSale) { query = query + "&on_sale=true"; this.filterOnSale = true; this.applyFilter = true; }

    if (this.selectedTab != '') query = query + '&category=' + this.selectedTab;
    if (this.price.lower != 0) query = query + "&min_price=" + this.price.lower;
    if (this.price.upper != this.config.filterMaxPrice) query = query + "&max_price=" + this.price.upper;
    query = query + "&status=publish"
    console.log(query);
    this.config.Woocommerce.getAsync(query).then((dat) => {
      let data = JSON.parse(dat.body);
      // console.log(data.product_data.length + "   " + this.page);
      this.infinite.complete();
      if (this.page == 1) { this.products = new Array; this.loading.hide(); this.scrollToTop(); }
      if (data.length != 0) {
        this.page++;
        for (let value of data) {
          this.products.push(value);
        }
      }

      if (data.length == 0) { this.infinite.enable(false); }

      this.applicationRef.tick();
      this.loadingServerData = true;
    });

  }

  //changing tab
  changeTab(c) {
    this.applyFilter = false;
    this.infinite.enable(true);
    this.page = 1;
    if (c == '') this.selectedTab = c
    else this.selectedTab = c.id;
    this.type = "latest";
    this.getProducts(null);
  }

  //============================================================================================  
  // filling filter array for keyword search 
  fillFilterArray = function (value, option) {
    if (option == "sale") this.filterOnSale = value._value;
    else if (option == 'featured') this.filterFeatured = value._value;
  };
  applyFilters() {
    this.type = "latest";
    this.applyFilter = true;
    this.infinite.enable(true);
    this.page = 1;
    this.getProducts(null);
  }
  resetFilters() {
    this.type = "latest";
    this.on_sale = false;
    this.featured = false;
    this.filterFeatured = false;
    this.filterOnSale = false;
    this.page = 1;
    this.applyFilter = false;
    this.infinite.enable(true);
    this.price = { lower: 0, upper: this.maxAmount };
    this.getProducts(null);
  }
  ionViewDidEnter() {
    //this.product = this.navParams.get('data');
  }
  ngOnChanges() {

  }

  getSortProducts(value) {



    //console.log(value);
    // if (value == this.sortOrder) return 0;
    // else {
    this.sortOrder = value;
    this.infinite.enable(true);
    this.page = 1;
    this.type = "";
    this.getProducts(null);
    // }
  }

  openSortBy() {
    //let array = [];
    this.sortArray.forEach((value, key, index) => {
      console.log(value);
      //array.push(key);
    });

    var buttonArray = [];
    this.translate.get(this.sortArray).subscribe((res) => {
      console.log(res);

      for (let key in res) {
        buttonArray.push({ text: res[key], handler: () => { this.getSortProducts(key) } });
      }
      this.translate.get('Cancel').subscribe((res) => {
        buttonArray.push(
          {
            text: res,
            role: 'cancel',
            handler: () => {
              //console.log('Cancel clicked');
            }
          }
        );
        var actionSheet = this.actionSheet.create({
          buttons: buttonArray
        });
        actionSheet.present();
      });
    });


  }
  changeLayout() {
    if (this.productView == 'list') this.productView = "grid";
    else this.productView = "list";

    this.scrollToTop();
  }

  scrollToTop() {
    this.content.scrollToTop(700);
    this.scrollTopButton = false;
  }
  onScroll(e) {
    if (e.scrollTop >= 1200) this.scrollTopButton = true;
    if (e.scrollTop < 1200) this.scrollTopButton = false;
    //else this.scrollTopButton=false;
    //   console.log(e);
  }
  openCart() {
    this.navCtrl.push(CartPage);
  }
  ionViewDidLoad() {
    // console.log("loaded");

    try {
      setTimeout(() => {
        let ind = 0;
        this.shared.allCategories.forEach((value, index) => {
          if (this.selectedTab == value.id) {
            ind = index; console.log("index to go " + ind);
          }
        });
        this.slides.slideTo(ind, 1000, true);
      }, 100);
    } catch (error) {

    }
  }

  //=======================================================================================
  getAllAttributes() {
    //getting All attributes
    this.config.Woocommerce.getAsync("products/attributes").then((data) => {
      this.attributes = JSON.parse(data.body);
      //console.log(this.attributes);
      this.applicationRef.tick();
      this.getAttributesValues();
    });
  }
  //=======================================================================================
  getAttributesValues() {
    for (let a of this.attributes) {
      this.config.Woocommerce.getAsync("products/attributes/" + a.id + "/terms?per_page=100&hide_empty=true").then((data) => {
        a.values = JSON.parse(data.body);
        // console.log(a);
        this.applicationRef.tick();
      });
    }
  }
  //=======================================================================================
  selectAttribute(a, v) {
    console.log(v);
  }
}
