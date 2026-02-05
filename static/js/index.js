/**
 * 视频对比滑块组件（简化版 - 无控制栏）
 * Video Comparison Slider Component
 */
class VideoComparisonSlider {
  constructor(container) {
    this.container = container;
    this.videoLeft = container.querySelector('.video-left video');
    this.videoRight = container.querySelector('.video-right video');
    this.videoLeftWrapper = container.querySelector('.video-left');
    this.handle = container.querySelector('.video-comparison-handle');

    this.isDragging = false;
    this.position = 50;
    this.videosReady = 0;
    this.masterDuration = 0;
    this.leftLoaded = false;
    this.rightLoaded = false;
    this.initialized = false;

    // Add buffering state tracking
    this.isBuffering = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updatePosition(50);

    // 如果视频已经加载完成（缓存），手动触发
    if (this.videoLeft.readyState >= 1) {
      this.onVideoLoaded('left');
    }
    if (this.videoRight.readyState >= 1) {
      this.onVideoLoaded('right');
    }
  }

  // Resets the state of the slider, crucial for when video sources change
  reset() {
    this.videosReady = 0;
    this.leftLoaded = false;
    this.rightLoaded = false;
    this.initialized = false;
    this.isBuffering = false;

    // Reset playback rates to default to avoid carry-over speed issues
    this.videoLeft.playbackRate = 1;
    this.videoRight.playbackRate = 1;

    // Reset time and pause
    this.videoLeft.currentTime = 0;
    this.videoRight.currentTime = 0;
    this.videoLeft.pause();
    this.videoRight.pause();
  }

  bindEvents() {
    // 滑块拖拽事件
    this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
    this.handle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });

    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());

    // 点击容器也可以移动滑块
    this.container.querySelector('.video-comparison-wrapper').addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.moveToPosition(e);
      }
    });

    // 视频加载完成
    this.videoLeft.addEventListener('loadedmetadata', () => this.onVideoLoaded('left'));
    this.videoRight.addEventListener('loadedmetadata', () => this.onVideoLoaded('right'));

    // 循环播放处理
    this.videoLeft.addEventListener('ended', () => this.restart());
    this.videoRight.addEventListener('ended', () => {
      this.videoRight.currentTime = 0;
      this.videoRight.play();
    });

    // ---------------------------------------------------------
    // Enhanced Synchronization Logic (Buffering Sync Only)
    // ---------------------------------------------------------

    // 1. Buffering Sync: If either waits, both wait.
    const onWaiting = () => {
      if (!this.isBuffering) {
        this.isBuffering = true;
        this.videoLeft.pause();
        this.videoRight.pause();
        // console.log('Buffering detected, pausing both videos');
      }
    };

    // 2. Resume Sync: Only play when both are ready.
    const onCanPlay = () => {
      if (this.isBuffering) {
        // Check if both have enough data to move forward
        const leftReady = this.videoLeft.readyState >= 3; // HAVE_FUTURE_DATA
        const rightReady = this.videoRight.readyState >= 3;

        if (leftReady && rightReady) {
          this.isBuffering = false;
          // Resume both videos together
          this.videoLeft.play();
          this.videoRight.play();
          // console.log('Buffering resolving, resuming both videos');
        }
      }
    };

    this.videoLeft.addEventListener('waiting', onWaiting);
    this.videoRight.addEventListener('waiting', onWaiting);

    this.videoLeft.addEventListener('playing', onCanPlay);
    this.videoRight.addEventListener('playing', onCanPlay);
    this.videoLeft.addEventListener('canplay', onCanPlay);
    this.videoRight.addEventListener('canplay', onCanPlay);
  }

  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.container.style.cursor = 'ew-resize';
  }

  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const rect = this.container.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let position = ((clientX - rect.left) / rect.width) * 100;

    position = Math.max(5, Math.min(95, position));
    this.updatePosition(position);
  }

  endDrag() {
    this.isDragging = false;
    this.container.style.cursor = '';
  }

  moveToPosition(e) {
    const rect = this.container.getBoundingClientRect();
    let position = ((e.clientX - rect.left) / rect.width) * 100;
    position = Math.max(5, Math.min(95, position));
    this.updatePosition(position);
  }

  updatePosition(position) {
    this.position = position;
    this.handle.style.left = position + '%';
    this.videoLeftWrapper.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
  }

  onVideoLoaded(which) {
    if (which === 'left' && this.leftLoaded) return;
    if (which === 'right' && this.rightLoaded) return;

    if (which === 'left') this.leftLoaded = true;
    if (which === 'right') this.rightLoaded = true;

    this.videosReady++;

    if (this.videosReady >= 2 && !this.initialized) {
      this.initialized = true;
      this.syncVideoDurations();
      this.play();
    }
  }

  syncVideoDurations() {
    const leftDuration = this.videoLeft.duration;
    const rightDuration = this.videoRight.duration;

    this.masterDuration = Math.max(leftDuration, rightDuration);

    if (leftDuration < rightDuration) {
      this.videoLeft.playbackRate = leftDuration / rightDuration;
      this.videoRight.playbackRate = 1;
    } else if (rightDuration < leftDuration) {
      this.videoLeft.playbackRate = 1;
      this.videoRight.playbackRate = rightDuration / leftDuration;
    } else {
      this.videoLeft.playbackRate = 1;
      this.videoRight.playbackRate = 1;
    }
  }

  play() {
    // Only play if both are ready enough
    if (this.videoLeft.readyState >= 2 && this.videoRight.readyState >= 2) {
        // Use Promise.all to catch any auto-play restrictions
        Promise.all([
            this.videoLeft.play(),
            this.videoRight.play()
        ]).catch(e => {
            console.log("Playback failed (possibly waiting for interaction):", e);
        });
    } else {
        // Wait for them to be ready
        this.isBuffering = true;
        // The 'playing'/'canplay' listeners will handle the actual start
    }
  }

  restart() {
    this.videoLeft.currentTime = 0;
    this.videoRight.currentTime = 0;
    this.play();
  }
}

// 初始化所有视频对比滑块
function initVideoComparisonSliders() {
  const containers = document.querySelectorAll('.video-comparison-container:not(.video-carousel-item):not(.method-comparison-item):not(.long-video-comparison-item)');
  containers.forEach(container => {
    new VideoComparisonSlider(container);
  });
}


/**
 * 视频预加载器
 * Video Preloader
 * 负责在后台静默加载视频资源，利用浏览器缓存提升切换体验
 */
class VideoPreloader {
  constructor() {
    this.queue = [];
    this.loaded = new Set();
    this.isLoading = false;
    this.isStarted = false;

    // 初始化后延迟启动，等待前台视频加载
    window.addEventListener('load', () => {
      // 额外延迟3秒，确保页面主要交互已就绪
      setTimeout(() => {
        this.start();
      }, 3000);
    });
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;
    console.log('VideoPreloader: Started background preloading...');
    this.checkQueue();
  }

  add(url) {
    if (!url) return;
    // 规范化URL（处理相对路径）
    try {
      const absoluteUrl = new URL(url, window.location.href).href;
      if (!this.loaded.has(absoluteUrl) && !this.queue.includes(absoluteUrl)) {
        this.queue.push(absoluteUrl);
        // 如果已经启动，尝试处理队列
        if (this.isStarted) {
          this.checkQueue();
        }
      }
    } catch (e) {
      console.warn('Invalid URL for preloader:', url);
    }
  }

  checkQueue() {
    if (this.isLoading || this.queue.length === 0 || !this.isStarted) return;

    this.isLoading = true;
    const url = this.queue.shift();

    // 使用 fetch 进行预加载
    fetch(url)
      .then(response => {
        if (response.ok) {
          this.loaded.add(url);
          // console.log('Preloaded:', url);
        }
      })
      .catch(err => {
        // console.log('Preload failed (will retry later if needed):', url);
      })
      .finally(() => {
        this.isLoading = false;
        // 继续处理下一个，给主线程一点喘息时间
        setTimeout(() => this.checkQueue(), 200);
      });
  }
}

// 全局预加载实例
const videoPreloader = new VideoPreloader();


/**
 * 视频对比轮播组件
 * Video Comparison Carousel Component
 */
class VideoComparisonCarousel {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.container = wrapper.querySelector('.video-comparison-container');
    this.prevBtn = wrapper.querySelector('.carousel-prev');
    this.nextBtn = wrapper.querySelector('.carousel-next');
    this.dots = wrapper.parentElement.querySelectorAll('.carousel-dot');

    this.currentIndex = 0;
    this.slider = null;

    // 视频对列表
    this.videoPairs = [
      { cg: 'Town01_Route0027_3.mp4', dwd: 'Town01_Route0027_3.mp4' },
      { cg: 'Town04_Route0030_1.mp4', dwd: 'Town04_Route0030_1.mp4' },
      { cg: 'Town06_Route0050_7.mp4', dwd: 'Town06_Route0050_7.mp4' },
      { cg: 'Town07_Route0035_4.mp4', dwd: 'Town07_Route0035_4_backup_5.mp4' },
      { cg: 'Town10HD_Route0038_4.mp4', dwd: 'Town10HD_Route0038_4.mp4' },
      { cg: 'Town10HD_Route0044_1.mp4', dwd: 'Town10HD_Route0044_1.mp4' }
    ];

    this.basePath = {
      cg: './assets/20260123-webvideo/cg_process/',
      dwd: './assets/20260123-webvideo/dwd_process/'
    };

    this.init();

    // 注册视频到预加载器
    this.registerVideos();
  }

  init() {
    this.bindEvents();
    this.loadVideoPair(0);
  }

  registerVideos() {
    this.videoPairs.forEach(pair => {
      // 略过当前正在播放的（currentIndex），虽然预加载器有去重，但为了逻辑清晰
      videoPreloader.add(this.basePath.cg + pair.cg);
      videoPreloader.add(this.basePath.dwd + pair.dwd);
    });
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index));
    });
  }

  prev() {
    const newIndex = (this.currentIndex - 1 + this.videoPairs.length) % this.videoPairs.length;
    this.goTo(newIndex);
  }

  next() {
    const newIndex = (this.currentIndex + 1) % this.videoPairs.length;
    this.goTo(newIndex);
  }

  goTo(index) {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.loadVideoPair(index);
    this.updateDots();
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  loadVideoPair(index) {
    const pair = this.videoPairs[index];
    const videoLeft = this.container.querySelector('.video-left video');
    const videoRight = this.container.querySelector('.video-right video');

    // 停止当前视频
    videoLeft.pause();
    videoRight.pause();

    // 更新视频源
    videoLeft.querySelector('source').src = this.basePath.cg + pair.cg;
    videoRight.querySelector('source').src = this.basePath.dwd + pair.dwd;

    // 重新加载视频
    videoLeft.load();
    videoRight.load();

    // 重新初始化滑块
    if (this.slider) {
      this.slider.reset();
    } else {
      this.slider = new VideoComparisonSlider(this.container);
    }
  }
}

// 初始化视频对比轮播
function initVideoComparisonCarousel() {
  const wrapper = document.querySelector('.video-carousel-wrapper');
  if (wrapper) {
    new VideoComparisonCarousel(wrapper);
  }
}

/**
 * 方法对比组件
 * Method Comparison Component
 */
class MethodComparisonCarousel {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.container = wrapper.querySelector('.video-comparison-container');
    this.prevBtn = wrapper.querySelector('.method-carousel-prev');
    this.nextBtn = wrapper.querySelector('.method-carousel-next');
    this.methodSelect = document.getElementById('method-select');
    this.dots = wrapper.parentElement.querySelectorAll('.method-indicators .carousel-dot');
    this.rightLabel = wrapper.querySelector('.method-label-right');

    this.currentSceneIndex = 0;
    this.currentMethod = 'dwd_process';
    this.slider = null;

    // 场景列表
    this.scenes = [
      'Town01_Route0027_3.mp4',
      'Town04_Route0030_1.mp4',
      'Town06_Route0050_7.mp4',
      'Town07_Route0035_4.mp4',
      'Town10HD_Route0038_4.mp4',
      'Town10HD_Route0044_1.mp4'
    ];

    // 方法名称映射
    this.methodNames = {
      'dwd_process': 'DwD (Ours)',
      'blur_result': 'Cosmos Blur',
      'edge_process': 'Cosmos Edge',
      'depth_result': 'Cosmos Depth',
      'depth_edge_result': 'Cosmos Depth+Edge',
      'seg_process': 'Cosmos Seg',
      'seg_edge_result': 'Cosmos Seg+Edge',
      'fresco_result': 'Fresco',
      'tclight_result': 'TCLight'
    };

    // 特殊文件名映射 (某些方法可能有不同的文件名)
    this.specialFileNames = {
      'dwd_process': {
        'Town07_Route0035_4.mp4': 'Town07_Route0035_4_backup_5.mp4'
      }
    };

    this.basePath = './assets/20260123-webvideo/';

    this.init();

    // 注册视频到预加载器
    this.registerVideos();
  }

  init() {
    this.bindEvents();
    this.loadVideo();
  }

  registerVideos() {
    const methods = Object.keys(this.methodNames);

    this.scenes.forEach(scene => {
      // 1. 左侧视频 (CG Process) - 每个场景只需要一个
      videoPreloader.add(this.basePath + 'cg_process/' + scene);

      // 2. 右侧视频 - 每个场景可能有多种方法
      // 注意：这里可能会产生大量请求，预加载器会串行处理，不会卡死浏览器
      methods.forEach(method => {
        const methodFileName = this.getFileName(method, scene);
        videoPreloader.add(this.basePath + method + '/' + methodFileName);
      });
    });
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prevScene());
    this.nextBtn.addEventListener('click', () => this.nextScene());

    this.methodSelect.addEventListener('change', (e) => {
      this.currentMethod = e.target.value;
      this.loadVideo();
      this.updateLabel();
    });

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToScene(index));
    });
  }

  prevScene() {
    const newIndex = (this.currentSceneIndex - 1 + this.scenes.length) % this.scenes.length;
    this.goToScene(newIndex);
  }

  nextScene() {
    const newIndex = (this.currentSceneIndex + 1) % this.scenes.length;
    this.goToScene(newIndex);
  }

  goToScene(index) {
    if (index === this.currentSceneIndex) return;
    this.currentSceneIndex = index;
    this.loadVideo();
    this.updateDots();
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentSceneIndex);
    });
  }

  updateLabel() {
    this.rightLabel.textContent = this.methodNames[this.currentMethod] || this.currentMethod;
  }

  getFileName(method, baseFileName) {
    // 检查是否有特殊文件名映射
    if (this.specialFileNames[method] && this.specialFileNames[method][baseFileName]) {
      return this.specialFileNames[method][baseFileName];
    }
    return baseFileName;
  }

  loadVideo() {
    const baseFileName = this.scenes[this.currentSceneIndex];
    const methodFileName = this.getFileName(this.currentMethod, baseFileName);

    const videoLeft = this.container.querySelector('.video-left video');
    const videoRight = this.container.querySelector('.video-right video');

    // 停止当前视频
    videoLeft.pause();
    videoRight.pause();

    // 更新视频源
    videoLeft.querySelector('source').src = this.basePath + 'cg_process/' + baseFileName;
    videoRight.querySelector('source').src = this.basePath + this.currentMethod + '/' + methodFileName;

    // 重新加载视频
    videoLeft.load();
    videoRight.load();

    // 更新标签
    this.updateLabel();

    // 重新初始化滑块
    if (this.slider) {
      this.slider.reset();
    } else {
      this.slider = new VideoComparisonSlider(this.container);
    }
  }
}

// 初始化方法对比组件
function initMethodComparisonCarousel() {
  const wrapper = document.querySelector('.method-comparison-wrapper');
  if (wrapper) {
    new MethodComparisonCarousel(wrapper);
  }
}

/**
 * 长视频对比组件
 * Long Video Comparison Component
 */
class LongVideoComparison {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.container = wrapper.querySelector('.video-comparison-container');
    this.methodSelect = document.getElementById('long-video-method-select');
    this.rightLabel = wrapper.querySelector('.long-video-label-right');

    this.currentMethod = 'dwd_process';
    this.slider = null;

    // 方法名称映射
    this.methodNames = {
      'dwd_process': 'DwD (Ours)',
      'blur_result': 'Cosmos Blur',
      'edge_process': 'Cosmos Edge',
      'depth_result': 'Cosmos Depth',
      'depth_edge_result': 'Cosmos Depth+Edge',
      'seg_process': 'Cosmos Seg',
      'seg_edge_result': 'Cosmos Seg+Edge',
      'fresco_result': 'Fresco',
      'tclight_result': 'TCLight'
    };

    // 特殊文件名映射 (1120_DV系列)
    this.fileNames = {
      'dwd_process': '1120_DV.mp4',
      'blur_result': '1120_DV.mp4',
      'edge_process': '1120_DV.mp4',
      'depth_result': '1120_DV.mp4',
      'depth_edge_result': '1120_DV_depth_edge.mp4',
      'seg_process': '1120_DV.mp4',
      'seg_edge_result': '1120_DV_seg_edge.mp4',
      'fresco_result': '1120_DV.mp4',
      'tclight_result': '1120_DV.mp4'
    };

    this.basePath = './assets/20260123-webvideo/';

    this.init();

    // 注册视频到预加载器
    this.registerVideos();
  }

  init() {
    this.bindEvents();
    // 初始化时直接创建slider，不重新加载视频（HTML已有正确源）
    this.slider = new VideoComparisonSlider(this.container);
    this.updateLabel();

    // REMOVED: Manual video.play() calls.
    // Now relying on VideoComparisonSlider's internal logic.
  }

  registerVideos() {
    // 1. 左侧视频 (固定)
    videoPreloader.add(this.basePath + 'cg_process/1120_DV.mp4');

    // 2. 右侧视频 (所有方法)
    Object.keys(this.methodNames).forEach(method => {
      const fileName = this.fileNames[method] || '1120_DV.mp4';
      videoPreloader.add(this.basePath + method + '/' + fileName);
    });
  }

  bindEvents() {
    this.methodSelect.addEventListener('change', (e) => {
      this.currentMethod = e.target.value;
      this.loadVideo();
    });
  }

  updateLabel() {
    this.rightLabel.textContent = this.methodNames[this.currentMethod] || this.currentMethod;
  }

  loadVideo() {
    const fileName = this.fileNames[this.currentMethod] || '1120_DV.mp4';

    const videoLeft = this.container.querySelector('.video-left video');
    const videoRight = this.container.querySelector('.video-right video');

    // 停止当前视频
    videoLeft.pause();
    videoRight.pause();

    // 更新视频源 - 直接设置 video 元素的 src 属性更可靠
    const leftSrc = this.basePath + 'cg_process/1120_DV.mp4';
    const rightSrc = this.basePath + this.currentMethod + '/' + fileName;

    console.log('Loading videos:', { left: leftSrc, right: rightSrc, method: this.currentMethod });

    videoLeft.src = leftSrc;
    videoRight.src = rightSrc;

    // 更新标签
    this.updateLabel();

    // REMOVED: Manual playWhenReady logic.
    // VideoComparisonSlider will handle playback when metadata loads.

    // 重新初始化滑块
    if (this.slider) {
      this.slider.reset();
    } else {
      this.slider = new VideoComparisonSlider(this.container);
    }
  }
}

// 初始化长视频对比组件
function initLongVideoComparison() {
  const wrapper = document.querySelector('.long-video-comparison-wrapper');
  if (wrapper) {
    new LongVideoComparison(wrapper);
  }
}

/**
 * Image Carousel Component
 */
class ImageCarousel {
  constructor(wrapperId, images) {
    this.wrapper = document.getElementById(wrapperId);
    if (!this.wrapper) return;

    this.imageElement = this.wrapper.querySelector('.carousel-image');
    this.prevBtn = this.wrapper.querySelector('.carousel-prev');
    this.nextBtn = this.wrapper.querySelector('.carousel-next');

    // Find the associated indicators container
    this.indicatorsContainer = document.getElementById('chart-indicators');
    this.dots = this.indicatorsContainer.querySelectorAll('.carousel-dot');

    this.images = images;
    this.currentIndex = 0;

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateImage();
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index));
    });
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  goTo(index) {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.updateImage();
  }

  updateImage() {
    // Optional: Add fade effect
    this.imageElement.style.opacity = '0.5';

    setTimeout(() => {
      this.imageElement.src = this.images[this.currentIndex];
      this.imageElement.style.opacity = '1';
    }, 150);

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    // 只初始化不带 no-bulma-init 类的滑块
    bulmaSlider.attach('.slider:not(.no-bulma-init)');

    // 初始化视频对比滑块
    initVideoComparisonSliders();

    // 初始化视频对比轮播
    initVideoComparisonCarousel();

    // 初始化方法对比组件
    initMethodComparisonCarousel();

    // 初始化长视频对比组件
    initLongVideoComparison();

    // 确保BEV视频播放
    document.querySelectorAll('.bev-video-item video').forEach(video => {
      video.play().catch(e => console.log('BEV video play error:', e));
    });

    // Initialize Chart Carousel
    const chartImages = [
      './static/images/charts/chart_01.png',
      './static/images/charts/chart_02.png',
      './static/images/charts/chart_03.png',
      './static/images/charts/chart_04.png'
    ];

    new ImageCarousel('chart-carousel', chartImages);

})