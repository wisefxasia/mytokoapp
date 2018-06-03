// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, InfiniteScroll } from 'ionic-angular';
import { NewsDetailPage } from '../news-detail/news-detail';
import { ConfigProvider } from '../../providers/config/config';
import { LoadingProvider } from '../../providers/loading/loading';
import { Http } from '@angular/http';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';



@Component({
  selector: 'page-news-list',
  templateUrl: 'news-list.html',
})
export class NewsListPage {
  @ViewChild(InfiniteScroll) infinite: InfiniteScroll;

  name;
  id;
  page = 1;
  posts = new Array;
  loadingServerData = true;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public shared: SharedDataProvider,
    public config: ConfigProvider,
    public loading: LoadingProvider, ) {

    this.name = this.navParams.get('name');
    this.id = this.navParams.get('id');
    this.getPosts();
  }
  showPostDetail(post) {
    this.loading.autoHide(500);
    this.navCtrl.push(NewsDetailPage, { 'post': post });
  };

  getImagePost(post) {
    if (post._links["wp:featuredmedia"])
      this.http.get(post._links["wp:featuredmedia"][0].href).map(res => res.json()).subscribe(data => {
        post.image = data.source_url;
      });
  }

  //============================================================================================  
  //getting list of posts
  getPosts() {
    if (this.page == 1) { this.loading.show(); this.loadingServerData = false; }
    this.http.get(this.config.url + '/wp-json/wp/v2/posts/?page=' + this.page + "&categories=" + this.id).map(res => res.json()).subscribe(data => {

      this.infinite.complete();//stopping infinite scroll loader
      if (this.page == 1) {
        this.posts = []; this.infinite.enable(true);
        this.loading.hide();
      }

      this.page++;
      data.forEach((value, index) => {
        this.getImagePost(value);
        this.posts.push(value);
      });

      if (data.length < 9) {// if we get less than 10 products then infinite scroll will de disabled

        this.infinite.enable(false);//disabling infinite scroll
        if (this.posts.length != 0) {
          this.shared.toast("All Posts Loaded!");
        }
      }
      this.loadingServerData = true;
    }, err => {
      this.infinite.enable(false);
      // console.log("Error while loading posts from the server");
      // console.log(response);
    });
  };


}
