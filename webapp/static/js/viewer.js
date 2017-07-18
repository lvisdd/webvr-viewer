  //
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  //
  // var url = '../../web/compressed.tracemonkey-pldi-09.pdf';
  var url = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  // var url = '/static/pdf/compressed.tracemonkey-pldi-09.pdf';

  //
  // Disable workers to avoid yet another cross-origin issue (workers need
  // the URL of the script to be loaded, and dynamically loading a cross-origin
  // script does not work).
  //
  // PDFJS.disableWorker = true;

  //
  // In cases when the pdf.worker.js is located at the different folder than the
  // pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
  // shall be specified.
  //
  // PDFJS.workerSrc = '../../build/generic/build/pdf.worker.js';
  // PDFJS.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/1.8.412/pdf.worker.js';
  PDFJS.workerSrc = '/static/js/pdf.worker.js';

  var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1.0,
      canvas = document.getElementById('the-canvas'),
      ctx = canvas.getContext('2d');

  function renderAFrame(canvas, pageNum) {
    if ( document.querySelector("#targetContainer") != null ) {
      var element = document.querySelector("#targetContainer");
      element.parentNode.removeChild(element);
    }

    var container = document.createElement('div');
    // container.id = 'targetContainer' + pageNum;
    container.id = 'targetContainer';
    container.className = 'targetContainer';
    document.body.appendChild(container);
    // document.body.insertBefore(container, document.body.firstChild);
    
    // var el = document.querySelector('#targetContainer' + pageNum);
    var el = document.querySelector('#targetContainer');
    var div = document.createElement('div');
    // div.setAttribute('id', 'target' + pageNum);
    div.setAttribute('id', 'target');
    el.appendChild(div);
    
    // console.log('#page' + pageNum);
    
    var img = document.querySelector('#img') || document.createElement('img');
    img.setAttribute('src', canvas.toDataURL());
    img.id = 'img' + pageNum;
    img.style.width = '100%';
    img.style.height = '100%';
    img.alt = 'A-Frame';
    div.appendChild(img);

    // var scene = document.createElement('a-scene');
    var scene = document.querySelector('a-scene');
    // el.appendChild(scene);
    var sky = document.createElement('a-sky');
    sky.setAttribute('src', '/static/images/24978068361_f2a9545fa7_k.jpg');
    sky.setAttribute('rotation', '0 -90 0');
    scene.appendChild(sky);

    var assets = document.querySelector('#pdf') || document.createElement('a-assets');
    assets.setAttribute('id', 'pdf');
    assets.setAttribute('src', canvas.toDataURL());
    scene.appendChild(assets);

    var plane = document.createElement('a-plane');
    plane.setAttribute('src', '#pdf');
    // plane.setAttribute('width', canvas.width);
    // plane.setAttribute('height', canvas.height);
    plane.setAttribute('width', '25%');
    plane.setAttribute('height', '25%');
    plane.setAttribute('position', '0 0 0');
    scene.appendChild(plane);
  }

  function renderThumbnail() {
    // var promise = Promise.resolve();
    // for (var i = 1; i <= pdf.numPages; i++) {
    //   // Using promise to fetch and render the next page
    //   console.log(i);
    //   promise = promise.then(function (pageNum) {
    //     var scale = 1.5;
    //     var viewport = page.getViewport(scale);
    //     var canvas = document.getElementById('thumbnail-canvas');
    //     var context = canvas.getContext('2d');
    //     canvas.height = viewport.height;
    //     canvas.width = viewport.width;
    // 
    //     var task = page.render({canvasContext: context, viewport: viewport})
    //     return task.promise.then(function(){
    //       console.log(canvas.toDataURL('image/jpeg'));
    //       return Promise.resolve();
    //     });
    //   });
    // }
    // Promise.resolve(promise);

    var promise = Promise.resolve();
    for (var i = 1; i <= pdf.numPages; i++) {
      // Using promise to fetch and render the next page
      promise = promise.then(function (pageNum) {
        return pdf.getPage(pageNum).then(function (page) {
          console.log(i);
          // var viewport = page.getViewport(DEFAULT_SCALE);
          // var container = document.createElement('div');
          // container.id = 'pageContainer' + pageNum;
          // container.className = 'pageContainer';
          // container.style.width = viewport.width + 'px';
          // container.style.height = viewport.height + 'px';
          // document.body.appendChild(container);
          // 
          // return page.getOperatorList().then(function (opList) {
          //   var svgGfx = new svgLib.SVGGraphics(page.commonObjs, page.objs);
          //   return svgGfx.getSVG(opList, viewport).then(function (svg) {
          //     container.appendChild(svg);
          //   });
          // });
        });
      }.bind(null, i));
    }


  }

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.display = 'none';

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        console.log('Page rendered');
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
        renderAFrame(canvas, pageNum);
        renderThumbnail();
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });
