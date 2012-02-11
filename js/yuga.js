/*
 * forked yuga.js 0.7.2 - 優雅なWeb制作のためのJS
 * Copyright (c) 2009 Kyosuke Nakamura (kyosuke.jp)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since:     2006-10-30
 * Modified:  2012-02-04
 *
 * jQuery 1.7.1
 * ThickBox 3.1
 */

/*
 * [使用方法] XHTMLのhead要素内で次のように読み込みます。

 <link rel="stylesheet" href="css/thickbox.css" type="text/css" media="screen" />
 <script type="text/javascript" src="js/jquery.js"></script>
 <script type="text/javascript" src="js/thickbox.js"></script>
 <script type="text/javascript" src="js/yuga.js" charset="utf-8"></script>

 */

(function($) {

  $(function() {
    $.yuga.externalLink();
    $.yuga.scroll();
  });

  // ---------------------------------------------------------------------

  $.yuga = {
    // URIを解析したオブジェクトを返すfunction
    Uri: function(path) {
      var self = this;
      this.originalPath = path;
      // 絶対パスを取得
      this.absolutePath = (function() {
        var e = document.createElement('a');
        e.href = path;
        return e.href;
      })();
      // 絶対パスを分解
      var fields = {
        'schema' : 2,
        'username' : 5,
        'password' : 6,
        'host' : 7,
        'path' : 9,
        'query' : 10,
        'fragment' : 11
      };
      var r = /^((\w+):)?(\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/.exec(this.absolutePath);
      for (var field in fields) {
        this[field] = r[fields[field]];
      }
      this.querys = {};
      if (this.query) {
        $.each(self.query.split('&'), function() {
          var a = this.split('=');
          if (a.length == 2)
            self.querys[a[0]] = a[1];
        });
      }
    },
    // 外部リンクは別ウインドウを設定
    externalLink: function(options) {
      var c = $.extend({
                windowOpen: true,
                externalClass: 'externalLink',
                addIconSrc: ''
      }, options);
      var uri = new $.yuga.Uri(location.href);
      var e = $('a[href^="http://"]').not('a[href^="' + uri.schema + '://' + uri.host + '/' + '"]');
      if (c.windowOpen) {
        e.click(function() {
          window.open(this.href, '_blank');
          return false;
        });
      }
      if (c.addIconSrc)
        e.not(':has(img)').after($('<img src="' + c.addIconSrc + '" class="externalIcon" />'));
      e.addClass(c.externalClass);
    },
    // ページ内リンクはするするスクロール
    scroll: function(options) {
      // ドキュメントのスクロールを制御するオブジェクト
      var scroller = (function() {
        var c = $.extend({
          easing: 100,
          step: 30,
          fps: 60,
          fragment: ''
                }, options);
        c.ms = Math.floor(1000 / c.fps);
        var timerId;
        var param = {
          stepCount: 0,
          startY: 0,
          endY: 0,
          lastY: 0
        };
        // スクロール中に実行されるfunction
        function move() {
          if (param.stepCount == c.step) {
            // スクロール終了時
            setFragment(param.hrefdata.absolutePath);
            window.scrollTo(getCurrentX(), param.endY);
          } else if (param.lastY == getCurrentY()) {
            // 通常スクロール時
            param.stepCount++;
            window.scrollTo(getCurrentX(), getEasingY());
            param.lastY = getEasingY();
            timerId = setTimeout(move, c.ms);
          } else {
            // キャンセル発生
            if (getCurrentY() + getViewportHeight() == getDocumentHeight()) {
              // 画面下のためスクロール終了
              setFragment(param.hrefdata.absolutePath);
            }
          }
        }
        function setFragment(path) {
          location.href = path;
        }
        function getCurrentY() {
          return document.body.scrollTop || document.documentElement.scrollTop;
        }
        function getCurrentX() {
          return document.body.scrollLeft || document.documentElement.scrollLeft;
        }
        function getDocumentHeight() {
          return document.documentElement.scrollHeight || document.body.scrollHeight;
        }
        function getViewportHeight() {
          return (!$.browser.safari && !$.browser.opera) ? document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight : window.innerHeight;
        }
        function getEasingY() {
          return Math.floor(getEasing(param.startY, param.endY, param.stepCount, c.step, c.easing));
        }
        function getEasing(start, end, stepCount, step, easing) {
          var s = stepCount / step;
          return (end - start) * (s + easing / (100 * Math.PI) * Math.sin(Math.PI * s)) + start;
        }
        return {
          set: function(options) {
            this.stop();
            if (options.startY == undefined)
              options.startY = getCurrentY();
            param = $.extend(param, options);
            param.lastY = param.startY;
            timerId = setTimeout(move, c.ms);
          },
          stop: function() {
            clearTimeout(timerId);
            param.stepCount = 0;
          }
        };
      })();
      $('a[href^=#], area[href^=#]').not('a[href=#], area[href=#]').each(function() {
        this.hrefdata = new $.yuga.Uri(this.getAttribute('href'));
      }).click(function() {
        var target = $('#' + this.hrefdata.fragment);
        if (target.length == 0)
          target = $('a[name=' + this.hrefdata.fragment + ']');
        if (target.length) {
          scroller.set({
            endY: target.offset().top,
            hrefdata: this.hrefdata
          });
          return false;
        }
      });
    }
  };
})(jQuery);
