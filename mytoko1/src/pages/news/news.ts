// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, InfiniteScroll } from 'ionic-angular';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { LoadingProvider } from '../../providers/loading/loading';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { TranslateService } from '@ngx-translate/core';
import { NewsDetailPage } from '../news-detail/news-detail';
import { NewsListPage } from '../news-list/news-list';
import { CartPage } from '../cart/cart';
import { SearchPage } from '../search/search';



@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  @ViewChild(InfiniteScroll) infinite: InfiniteScroll;
  featuredPosts = new Array;
  segments = 'newest';

  //WordPress intergation
  categories = new Array;
  //page varible
  page = 1;

  //WordPress intergation
  posts = new Array;
  //page varible
  page2 = 1;
  loadingServerDataPosts = true;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public config: ConfigProvider,
    public loading: LoadingProvider,
    public shared: SharedDataProvider,
    translate: TranslateService) {

    var dat: { [k: string]: any } = {};
    dat.language_id = this.config.langId;
    dat.is_feature = 1;
    this.http.get(this.config.url + '/wp-json/wp/v2/posts/?sticky=true&page=' + this.page2).map(res => res.json()).subscribe(data => {
      data.forEach((value, index) => {
        this.getImagePost(value);
      });
      this.featuredPosts = data;
    });

    this.getPosts();

  }

  getImagePost(post) {
    if (post._links["wp:featuredmedia"])
      this.http.get(post._links["wp:featuredmedia"][0].href).map(res => res.json()).subscribe(data => {
        post.image = data.source_url;
      });
  }


  //========================================= tab newest categories ===============================================================================

  getCategories = function () {

    var data: { [k: string]: any } = {};
    data.language_id = this.config.langId;
    data.page_number = this.page2;
    this.http.get(this.config.url + '/wp-json/wp/v2/categories/?page=' + this.page2).map(res => res.json()).subscribe(data => {

      if (this.page2 == 1) { this.categories = []; }

      this.page2++;
      data.forEach((value, index) => {
        this.categories.push(Object.assign(value, { image: '' }));
      });
      // console.log(data.data.length);
      if (data.length == 0) {// if we get less than 10 products then infinite scroll will de disabled
        this.shared.toast("All Categories Loaded!");
        this.getRandomImage();
      }
      else this.getCategories();

    }, function (response) {
      // console.log("Error while loading categories from the server");
      // console.log(response);
    });

  };

  //============================================================================================  
  //getting list of posts
  getPosts() {
    if (this.page == 1) { this.loading.show(); this.loadingServerDataPosts = false; }
    this.http.get(this.config.url + '/wp-json/wp/v2/posts/?page=' + this.page).map(res => res.json()).subscribe(data => {

      this.infinite.complete();//stopping infinite scroll loader
      if (this.page == 1) { this.posts = []; this.infinite.enable(true); this.loading.hide(); this.getCategories(); }
      this.page++;
      data.forEach((value, index) => {
        this.getImagePost(value);
        this.posts.push(value);
      });
      this.posts.concat(data);
      if (data.length < 9) {// if we get less than 10 products then infinite scroll will de disabled

        this.infinite.enable(false);//disabling infinite scroll
        if (this.posts.length != 0) {
          this.shared.toast("All Posts Loaded!");
        }
      }

      this.loadingServerDataPosts = true;
    }, err => {
      this.infinite.enable(false);
      // console.log("Error while loading posts from the server");
      // console.log(response);
    });

  };

  //============================================================================================  
  //getting list of sub categories from the server
  showPostDetail(post) {
    this.loading.autoHide(500);
    this.navCtrl.push(NewsDetailPage, { 'post': post });
  };
  openPostsPage(name, id) {
    //this.loading.autoHide(500);
    this.navCtrl.push(NewsListPage, { 'name': name, 'id': id });
  }

  openCart() {
    this.navCtrl.push(CartPage);
  }
  openSearch() {
    this.navCtrl.push(SearchPage);
  }
  ionViewWillEnter() {
    if (this.config.admob == 1) this.shared.showAd();
  }
  // <!-- 2.0 updates -->
  getRandomImage() {
    try {

      this.categories.forEach((value, index) => {
        let rand = this.getRandomPost();
        if (rand._links["wp:featuredmedia"])
          this.http.get(rand._links["wp:featuredmedia"][0].href).map(res => res.json()).subscribe(data => {
            value.image = data.source_url;
            console.log(value.image);
          });
      });

    } catch (error) {

    }
  }
  getRandomPost() {
    let rand = this.posts[Math.floor(Math.random() * this.posts.length)];
    if (rand.sticky == false) return rand;
    else this.getRandomPost();
  }
}
